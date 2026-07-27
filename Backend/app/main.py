"""
FastAPI app entrypoint.

Run with:
    uvicorn app.main:app --reload
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import auth, documents, chat

# Creates tables in Postgres if they don't already exist.
# (Fine for dev; use Alembic migrations for production.)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Business Assistant API", version="0.1.0")

# Allow the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(chat.router)


@app.get("/")
def root():
    return {"status": "ok", "message": "AI Business Assistant API is running"}