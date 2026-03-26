from datetime import datetime

from pydantic import BaseModel, EmailStr


# ── Auth ──────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    display_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    email: str
    display_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Decision ─────────────────────────────────────────────────────────

class DecisionRequest(BaseModel):
    question: str
    context: str | None = None
    options: list[str] | None = None
    session_id: str | None = None


class Recommendation(BaseModel):
    pros: list[str]
    cons: list[str]
    recommendation: str
    confidence: str
    clarifying_questions: list[str] | None = None


class DecisionResponse(BaseModel):
    session_id: str
    message: str
    recommendation: Recommendation | None = None


# ── Sessions / History ───────────────────────────────────────────────

class SessionOut(BaseModel):
    id: str
    title: str
    created_at: datetime

    model_config = {"from_attributes": True}


class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    recommendation_json: dict | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
