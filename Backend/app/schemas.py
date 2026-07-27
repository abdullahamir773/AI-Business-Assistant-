"""
Pydantic schemas - define the shape of request/response JSON.
"""
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# ---------- Auth ----------

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str | None = None
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    email: EmailStr
    full_name: str | None = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# ---------- Documents ----------

class DocumentOut(BaseModel):
    id: str
    filename: str
    status: str
    uploaded_at: datetime

    model_config = ConfigDict(from_attributes=True)


# ---------- Chat ----------

class ChatRequest(BaseModel):
    message: str


class ChatMessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ChatResponse(BaseModel):
    answer: str
    sources: list[str] = []
