from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from .routes.shares import router as shares_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Cryptoshare API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(shares_router)


@app.get("/")
def root():
    return {"message": "Cryptoshare API running"}