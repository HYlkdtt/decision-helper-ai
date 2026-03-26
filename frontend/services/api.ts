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

export interface UserOut {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserOut;
}

export interface SessionOut {
  id: string;
  title: string;
  created_at: string;
}

export interface MessageOut {
  id: string;
  role: string;
  content: string;
  recommendation_json: Recommendation | null;
  created_at: string;
}

const API_URL = "http://localhost:8000";

let _token: string | null = null;

export function setToken(token: string | null) {
  _token = token;
}

export function getToken(): string | null {
  return _token;
}

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (_token) {
    headers["Authorization"] = `Bearer ${_token}`;
  }
  return headers;
}

// ── Auth ────────────────────────────────────────────────────────────

export async function register(
  email: string,
  password: string,
  displayName: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, display_name: displayName }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Register failed: ${res.status}`);
  }
  return res.json();
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Login failed: ${res.status}`);
  }
  return res.json();
}

export async function getMe(): Promise<UserOut> {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error("Not authenticated");
  return res.json();
}

// ── Decision ────────────────────────────────────────────────────────

export async function sendDecision(
  question: string,
  context?: string,
  options?: string[],
  sessionId?: string
): Promise<DecisionResponse> {
  const res = await fetch(`${API_URL}/api/decide`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      question,
      context: context || null,
      options: options || null,
      session_id: sessionId || null,
    }),
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

// ── Sessions ────────────────────────────────────────────────────────

export async function getSessions(): Promise<SessionOut[]> {
  const res = await fetch(`${API_URL}/api/sessions`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load sessions: ${res.status}`);
  return res.json();
}

export async function getSessionMessages(sessionId: string): Promise<MessageOut[]> {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}/messages`, {
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to load messages: ${res.status}`);
  return res.json();
}

export async function deleteSession(sessionId: string): Promise<void> {
  const res = await fetch(`${API_URL}/api/sessions/${sessionId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`Failed to delete session: ${res.status}`);
}
