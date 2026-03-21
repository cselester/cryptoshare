from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..models import Share
from ..schemas import (
    ShareCreate,
    ShareCreateResponse,
    SharePayloadResponse,
    ConsumeResponse,
    AttemptResponse,
)

router = APIRouter(prefix="/api/shares", tags=["shares"])


@router.post("", response_model=ShareCreateResponse)
def create_share(payload: ShareCreate, db: Session = Depends(get_db)):
    if not payload.ciphertext or not payload.salt or not payload.iv:
        raise HTTPException(status_code=400, detail="Missing required fields")

    if len(payload.ciphertext) > 50000:
        raise HTTPException(status_code=400, detail="Payload too large")

    share = Share(
        ciphertext=payload.ciphertext,
        salt=payload.salt,
        iv=payload.iv,
        expires_at=datetime.utcnow() + timedelta(minutes=10),
    )

    db.add(share)
    db.commit()
    db.refresh(share)

    return {
        "id": share.id,
        "expires_in_seconds": 600,
    }


@router.get("/{share_id}", response_model=SharePayloadResponse)
def get_share(share_id: str, db: Session = Depends(get_db)):
    share = db.query(Share).filter(Share.id == share_id).first()

    if not share:
        raise HTTPException(status_code=404, detail="Secret not found")

    now = datetime.utcnow()

    if share.viewed:
        db.delete(share)
        db.commit()
        raise HTTPException(status_code=404, detail="Secret already viewed")

    if share.expires_at < now:
        db.delete(share)
        db.commit()
        raise HTTPException(status_code=404, detail="Secret expired")

    if share.attempt_count >= share.max_attempts:
        db.delete(share)
        db.commit()
        raise HTTPException(status_code=403, detail="Too many attempts")

    return {
    "id": share.id,
    "ciphertext": share.ciphertext,
    "salt": share.salt,
    "iv": share.iv,
    "remaining_attempts": share.max_attempts - share.attempt_count,
    "expires_at": share.expires_at.isoformat(),
}


@router.post("/{share_id}/attempt", response_model=AttemptResponse)
def register_failed_attempt(share_id: str, db: Session = Depends(get_db)):
    share = db.query(Share).filter(Share.id == share_id).first()

    if not share:
        raise HTTPException(status_code=404, detail="Secret not found")

    now = datetime.utcnow()

    if share.viewed or share.expires_at < now:
        db.delete(share)
        db.commit()
        raise HTTPException(status_code=404, detail="Secret unavailable")

    share.attempt_count += 1
    remaining = max(share.max_attempts - share.attempt_count, 0)

    db.commit()

    if share.attempt_count >= share.max_attempts:
        db.delete(share)
        db.commit()
        raise HTTPException(status_code=403, detail="Too many attempts")

    return {
        "status": "attempt recorded",
        "remaining_attempts": remaining,
    }


@router.post("/{share_id}/consume", response_model=ConsumeResponse)
def consume_share(share_id: str, db: Session = Depends(get_db)):
    share = db.query(Share).filter(Share.id == share_id).first()

    if not share:
        raise HTTPException(status_code=404, detail="Secret not found")

    share.viewed = True
    share.viewed_at = datetime.utcnow()
    db.commit()

    db.delete(share)
    db.commit()

    return {"status": "deleted"}