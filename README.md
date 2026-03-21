# Decision Helper AI

An AI-powered decision-making assistant built with FastAPI and React Native (Expo). Describe a decision you're facing and get a structured analysis with pros, cons, a recommendation, and a confidence level.

## Tech Stack

- **Backend**: FastAPI, Groq API (Llama 3.3 70B)
- **Frontend**: React Native (Expo), TypeScript

## Setup

### Backend

1. Create a virtual environment and install dependencies:
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install fastapi uvicorn pydantic python-dotenv groq
   ```

2. Add your Groq API key to `.env`:
   ```
   GROQ_API_KEY=your-key-here
   ```
   Get a free key at [console.groq.com](https://console.groq.com)

3. Start the server:
   ```bash
   uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend

1. Install dependencies:
   ```bash
   cd frontend
   npm install
   ```

2. Start the app:
   ```bash
   npx expo start
   ```
   Press `w` for web, `a` for Android, or `i` for iOS.

> If testing on a physical device, update `API_URL` in `frontend/services/api.ts` to your machine's LAN IP.

## API

### `POST /api/decide`

**Request:**
```json
{
  "question": "Should I learn Rust or Go?",
  "context": "I'm a web developer looking to learn systems programming",
  "options": ["Rust", "Go"],
  "session_id": null
}
```

**Response:**
```json
{
  "session_id": "uuid",
  "message": "analysis text...",
  "recommendation": {
    "pros": ["..."],
    "cons": ["..."],
    "recommendation": "...",
    "confidence": "high",
    "clarifying_questions": []
  }
}
```

### `GET /api/health`

Returns `{"status": "ok"}`.
