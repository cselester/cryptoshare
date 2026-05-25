import os

SHARE_EXPIRY_MINUTES = 10
SHARE_EXPIRY_SECONDS = SHARE_EXPIRY_MINUTES * 60
MAX_CIPHERTEXT_LENGTH = 50000
DEFAULT_MAX_ATTEMPTS = 5

# In production, set ALLOWED_ORIGINS to your Cloud Run frontend URL
# e.g. "https://cryptoshare-frontend-xxxx-uc.a.run.app"
_origins_env = os.environ.get("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] or [
    "http://localhost:5173"
]
