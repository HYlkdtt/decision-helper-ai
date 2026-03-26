import uuid
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession

from .agent import get_decision
from .auth import (
    create_access_token,
    get_current_user,
    get_optional_user,
    hash_password,
    verify_password,
)
from .crud import (
    add_message,
    create_session,
    create_user,
    delete_session,
    get_history,
    get_session,
    get_session_messages,
    get_user_by_email,
    get_user_sessions,
    update_session_title,
)
from .database import Base, engine, get_db
from .db_models import User
from .models import (
    AuthResponse,
    DecisionRequest,
    DecisionResponse,
    LoginRequest,
    MessageOut,
    RegisterRequest,
    SessionOut,
    UserOut,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    await engine.dispose()


app = FastAPI(title="Decision Helper AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"name": "Decision Helper AI", "docs": "/docs"}


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── Auth ──────────────────────────────────────────────────────────────

@app.post("/api/auth/register", response_model=AuthResponse)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await get_user_by_email(db, body.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = await create_user(db, body.email, hash_password(body.password), body.display_name)
    token = create_access_token(user.id)
    return AuthResponse(
        access_token=token,
        user=UserOut(id=str(user.id), email=user.email, display_name=user.display_name, created_at=user.created_at),
    )


@app.post("/api/auth/login", response_model=AuthResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    user = await get_user_by_email(db, body.email)
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    token = create_access_token(user.id)
    return AuthResponse(
        access_token=token,
        user=UserOut(id=str(user.id), email=user.email, display_name=user.display_name, created_at=user.created_at),
    )


@app.get("/api/auth/me", response_model=UserOut)
async def me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=str(current_user.id),
        email=current_user.email,
        display_name=current_user.display_name,
        created_at=current_user.created_at,
    )


# ── Decision ─────────────────────────────────────────────────────────

@app.post("/api/decide", response_model=DecisionResponse)
async def decide(
    request: DecisionRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    if request.session_id:
        session_id = uuid.UUID(request.session_id)
        session = await get_session(db, session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
    else:
        session = await create_session(
            db,
            user_id=current_user.id if current_user else None,
            title=request.question[:200],
        )
        session_id = session.id

    history = await get_history(db, session_id)

    message, recommendation = await get_decision(
        question=request.question,
        context=request.context,
        options=request.options,
        history=history,
    )

    user_msg = request.question
    if request.context:
        user_msg += f"\n\nAdditional context: {request.context}"
    if request.options:
        user_msg += f"\n\nOptions: {', '.join(request.options)}"

    await add_message(db, session_id, "user", user_msg)
    await add_message(
        db,
        session_id,
        "assistant",
        message,
        recommendation_json=recommendation.model_dump() if recommendation else None,
    )

    if session.title == "New Decision":
        await update_session_title(db, session_id, request.question[:200])

    return DecisionResponse(
        session_id=str(session_id),
        message=message,
        recommendation=recommendation,
    )


# ── Sessions (protected) ─────────────────────────────────────────────

@app.get("/api/sessions", response_model=list[SessionOut])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sessions = await get_user_sessions(db, current_user.id)
    return [SessionOut(id=str(s.id), title=s.title, created_at=s.created_at) for s in sessions]


@app.get("/api/sessions/{session_id}/messages", response_model=list[MessageOut])
async def list_messages(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sid = uuid.UUID(session_id)
    session = await get_session(db, sid)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")

    messages = await get_session_messages(db, sid)
    return [
        MessageOut(
            id=str(m.id),
            role=m.role,
            content=m.content,
            recommendation_json=m.recommendation_json,
            created_at=m.created_at,
        )
        for m in messages
    ]


@app.delete("/api/sessions/{session_id}", status_code=204)
async def remove_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    sid = uuid.UUID(session_id)
    session = await get_session(db, sid)
    if not session or session.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    await delete_session(db, sid)
