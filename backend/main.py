from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .agent import get_decision
from .models import DecisionRequest, DecisionResponse
from .session_store import add_message, create_session, get_history

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

app = FastAPI(title="Decision Helper AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


@app.post("/api/decide", response_model=DecisionResponse)
async def decide(request: DecisionRequest):
    session_id = request.session_id or create_session()
    history = get_history(session_id)

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

    add_message(session_id, "user", user_msg)
    add_message(session_id, "assistant", message)

    return DecisionResponse(
        session_id=session_id,
        message=message,
        recommendation=recommendation,
    )
