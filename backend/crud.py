import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from .db_models import Message, Session, User


# ── Sessions ──────────────────────────────────────────────────────────

async def create_session(db: AsyncSession, user_id: uuid.UUID | None = None, title: str = "New Decision") -> Session:
    session = Session(user_id=user_id, title=title)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def get_session(db: AsyncSession, session_id: uuid.UUID) -> Session | None:
    return await db.get(Session, session_id)


async def get_user_sessions(db: AsyncSession, user_id: uuid.UUID) -> list[Session]:
    result = await db.execute(
        select(Session)
        .where(Session.user_id == user_id)
        .order_by(Session.created_at.desc())
    )
    return list(result.scalars().all())


async def delete_session(db: AsyncSession, session_id: uuid.UUID) -> None:
    session = await db.get(Session, session_id)
    if session:
        await db.delete(session)
        await db.commit()


async def update_session_title(db: AsyncSession, session_id: uuid.UUID, title: str) -> None:
    session = await db.get(Session, session_id)
    if session and session.title == "New Decision":
        session.title = title[:200]
        await db.commit()


# ── Messages ──────────────────────────────────────────────────────────

async def add_message(
    db: AsyncSession,
    session_id: uuid.UUID,
    role: str,
    content: str,
    recommendation_json: dict | None = None,
) -> Message:
    msg = Message(
        session_id=session_id,
        role=role,
        content=content,
        recommendation_json=recommendation_json,
    )
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def get_history(db: AsyncSession, session_id: uuid.UUID) -> list[dict]:
    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at)
    )
    return [{"role": m.role, "content": m.content} for m in result.scalars().all()]


async def get_session_messages(db: AsyncSession, session_id: uuid.UUID) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.session_id == session_id)
        .order_by(Message.created_at)
    )
    return list(result.scalars().all())


# ── Users ─────────────────────────────────────────────────────────────

async def create_user(db: AsyncSession, email: str, hashed_password: str, display_name: str) -> User:
    user = User(email=email, hashed_password=hashed_password, display_name=display_name)
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def get_user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_id(db: AsyncSession, user_id: uuid.UUID) -> User | None:
    return await db.get(User, user_id)
