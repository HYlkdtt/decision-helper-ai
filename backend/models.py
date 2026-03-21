from pydantic import BaseModel


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
