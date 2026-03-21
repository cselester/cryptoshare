from pydantic import BaseModel


class ShareCreate(BaseModel):
    ciphertext: str
    salt: str
    iv: str


class ShareCreateResponse(BaseModel):
    id: str
    expires_in_seconds: int


class SharePayloadResponse(BaseModel):
    id: str
    ciphertext: str
    salt: str
    iv: str
    remaining_attempts: int
    expires_at: str


class ConsumeResponse(BaseModel):
    status: str


class AttemptResponse(BaseModel):
    status: str
    remaining_attempts: int