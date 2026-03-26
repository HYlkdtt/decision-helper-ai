import json
import re

from groq import AsyncGroq

from .config import GROQ_API_KEY
from .models import Recommendation

SYSTEM_PROMPT = """You are a decision-making assistant. Help users make better decisions by analyzing pros, cons, consequences, and risks.

Respond with a JSON block in ```json ... ``` markers:
{
  "pros": ["advantages"],
  "cons": ["disadvantages"],
  "recommendation": "your recommendation and reasoning",
  "confidence": "high" | "medium" | "low",
  "clarifying_questions": ["questions if you need more info"]
}

You may include text before the JSON block. If you need more info, set confidence to "low" and include clarifying_questions.
"""


async def get_decision(
    question: str,
    context: str | None,
    options: list[str] | None,
    history: list[dict],
) -> tuple[str, Recommendation | None]:
    user_message = question
    if context:
        user_message += f"\n\nAdditional context: {context}"
    if options:
        user_message += f"\n\nOptions I'm considering: {', '.join(options)}"

    client = AsyncGroq(api_key=GROQ_API_KEY)

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    messages += history
    messages.append({"role": "user", "content": user_message})

    response = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=1024,
    )

    text = response.choices[0].message.content

    recommendation = None
    match = re.search(r"```json\s*([\s\S]*?)```", text)
    if match:
        try:
            data = json.loads(match.group(1))
            recommendation = Recommendation(**data)
        except (json.JSONDecodeError, ValueError):
            pass

    return text, recommendation
