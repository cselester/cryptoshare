from sqlalchemy import Column, String, DateTime, Boolean, Integer, Text
from datetime import datetime, timedelta
import uuid

from .db import Base


class Share(Base):
    __tablename__ = "shares"

    id = Column(String, primary_key=True, default=lambda: uuid.uuid4().hex[:8])
    ciphertext = Column(Text, nullable=False)
    salt = Column(String, nullable=False)
    iv = Column(String, nullable=False)

    created_at = Column(
        DateTime,
        default=lambda: datetime.utcnow()
    )

    expires_at = Column(
        DateTime,
        nullable=False,
        default=lambda: datetime.utcnow() + timedelta(minutes=10)
    )

    viewed = Column(Boolean, default=False)
    viewed_at = Column(DateTime, nullable=True)

    attempt_count = Column(Integer, default=0)
    max_attempts = Column(Integer, default=5)