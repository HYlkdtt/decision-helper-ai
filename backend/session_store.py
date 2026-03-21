import uuid

_sessions: dict[str, list[dict]] = {}


def create_session() -> str:
    session_id = str(uuid.uuid4())
    _sessions[session_id] = []
    return session_id


def get_history(session_id: str) -> list[dict]:
    return _sessions.get(session_id, [])


def add_message(session_id: str, role: str, content: str) -> None:
    if session_id not in _sessions:
        _sessions[session_id] = []
    _sessions[session_id].append({"role": role, "content": content})
