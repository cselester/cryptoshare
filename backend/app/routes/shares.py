from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..db import get_db
from ..schemas import (
    ShareCreate,
    ShareCreateResponse,
    SharePayloadResponse,
    ConsumeResponse,
    AttemptResponse,
)
from ..services import share_service

router = APIRouter(prefix="/api/shares", tags=["shares"])


@router.post("", response_model=ShareCreateResponse)
def create_share(payload: ShareCreate, db: Session = Depends(get_db)):
    return share_service.create_share(payload, db)


@router.get("/{share_id}", response_model=SharePayloadResponse)
def get_share(share_id: str, db: Session = Depends(get_db)):
    return share_service.get_share_payload(share_id, db)


@router.post("/{share_id}/attempt", response_model=AttemptResponse)
def register_failed_attempt(share_id: str, db: Session = Depends(get_db)):
    try:
        return share_service.register_failed_attempt(share_id, db)
    except HTTPException as exc:
        if exc.status_code == 404 and exc.detail in {
            "Secret expired",
            "Secret already viewed",
        }:
            raise HTTPException(status_code=404, detail="Secret unavailable") from exc
        raise


@router.post("/{share_id}/consume", response_model=ConsumeResponse)
def consume_share(share_id: str, db: Session = Depends(get_db)):
    return share_service.consume_share(share_id, db)
