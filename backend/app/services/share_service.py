from datetime import datetime, timedelta, timezone

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..core.config import (
    DEFAULT_MAX_ATTEMPTS,
    MAX_CIPHERTEXT_LENGTH,
    SHARE_EXPIRY_MINUTES,
    SHARE_EXPIRY_SECONDS,
)
from ..models import Share
from ..schemas import ShareCreate


def create_share(payload: ShareCreate, db: Session):
    if not payload.ciphertext or not payload.salt or not payload.iv:
        raise HTTPException(status_code=400, detail="Missing required fields")

    if len(payload.ciphertext) > MAX_CIPHERTEXT_LENGTH:
        raise HTTPException(status_code=400, detail="Payload too large")

    share = Share(
        ciphertext=payload.ciphertext,
        salt=payload.salt,
        iv=payload.iv,
        expires_at=_build_expiry_time(),
        max_attempts=DEFAULT_MAX_ATTEMPTS,
    )

    db.add(share)
    db.commit()
    db.refresh(share)

    return {
        "id": share.id,
        "expires_in_seconds": SHARE_EXPIRY_SECONDS,
        "expires_at": _as_utc_datetime(share.expires_at),
    }


def get_share_payload(share_id: str, db: Session):
    share = _get_share_or_raise(share_id, db)
    _ensure_share_is_available(share, db)
    return _serialize_share_payload(share)


def register_failed_attempt(share_id: str, db: Session):
    share = _get_share_or_raise(share_id, db)
    _ensure_share_is_available(share, db)

    share.attempt_count += 1
    remaining_attempts = max(share.max_attempts - share.attempt_count, 0)

    db.commit()

    if share.attempt_count >= share.max_attempts:
        _delete_share(share, db)
        raise HTTPException(status_code=403, detail="Too many attempts")

    return {
        "status": "attempt recorded",
        "remaining_attempts": remaining_attempts,
    }


def consume_share(share_id: str, db: Session):
    share = _get_share_or_raise(share_id, db)

    if share.viewed or share.expires_at < _utcnow():
        _delete_share(share, db)
        raise HTTPException(status_code=404, detail="Secret unavailable")

    share.viewed = True
    share.viewed_at = _utcnow()
    db.commit()

    _delete_share(share, db)

    return {"status": "deleted"}


def _get_share_or_raise(share_id: str, db: Session):
    share = db.query(Share).filter(Share.id == share_id).first()

    if not share:
        raise HTTPException(status_code=404, detail="Secret not found")

    return share


def _ensure_share_is_available(share: Share, db: Session):
    now = _utcnow()

    if share.viewed:
        _delete_share(share, db)
        raise HTTPException(status_code=404, detail="Secret already viewed")

    if share.expires_at < now:
        _delete_share(share, db)
        raise HTTPException(status_code=404, detail="Secret expired")

    if share.attempt_count >= share.max_attempts:
        _delete_share(share, db)
        raise HTTPException(status_code=403, detail="Too many attempts")


def _serialize_share_payload(share: Share):
    return {
        "id": share.id,
        "ciphertext": share.ciphertext,
        "salt": share.salt,
        "iv": share.iv,
        "remaining_attempts": share.max_attempts - share.attempt_count,
        "expires_at": _as_utc_datetime(share.expires_at),
    }


def _build_expiry_time():
    return _utcnow() + timedelta(minutes=SHARE_EXPIRY_MINUTES)


def _delete_share(share: Share, db: Session):
    db.delete(share)
    db.commit()


def _as_utc_datetime(value: datetime):
    if value.tzinfo is None:
        return value.replace(tzinfo=timezone.utc)

    return value.astimezone(timezone.utc)


def _utcnow():
    return datetime.utcnow()
