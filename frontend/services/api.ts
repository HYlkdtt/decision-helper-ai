export interface Recommendation {
  pros: string[];
  cons: string[];
  recommendation: string;
  confidence: "high" | "medium" | "low";
  clarifying_questions?: string[];
}

export interface DecisionResponse {
  session_id: string;
  message: string;
  recommendation: Recommendation | null;
}

const API_URL = "http://localhost:8000";

export async function sendDecision(
  question: string,
  context?: string,
  options?: string[],
  sessionId?: string
): Promise<DecisionResponse> {
  const response = await fetch(`${API_URL}/api/decide`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question,
      context: context || null,
      options: options || null,
      session_id: sessionId || null,
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}
