# Chalk

Chalk is a mobile-first billiards training app with:

- React + Vite frontend
- FastAPI backend
- Supabase authentication + profile data
- Gemini-powered coaching features handled by the backend

## Features

- Email/password auth (Supabase)
- Persisted login across refresh
- Idle session timeout auto-logout
- AI form analysis from uploaded/recorded video
- AI-generated 3-drill practice routines
- Dashboard, settings, and training views

## Architecture

### Frontend (`/`)

- React 19 + TypeScript + Vite
- Calls backend endpoints via `services/geminiService.ts`
- Uses Supabase client for auth/session
- Hydrates user profile from Supabase tables:
  - `user_profile`
  - `locations`
  - `user_league_ratings`

### Backend (`/Backend`)

- FastAPI app exposing:
  - `GET /health`
  - `POST /api/analyze-form`
  - `POST /api/generate-routine`
- Validates request payloads with Pydantic models
- Sends Gemini requests through `gemini_client.py`
- Uses retries + connection pooling for Gemini API calls

## Session Behavior

- Session persistence is enabled in Supabase client (`persistSession: true`)
- App restores auth state on page refresh via `supabase.auth.getSession()`
- App listens to `supabase.auth.onAuthStateChange(...)` for live auth updates
- Idle timeout signs out users after no activity for a configured period

Set idle timeout minutes in frontend env:

`VITE_IDLE_TIMEOUT_MINUTES=30`

Default is `30` minutes if not set.

## AI Flow

Frontend does not call Gemini directly.

1. Frontend sends request to backend (`/api/*`)
2. Backend validates input
3. Backend calls Gemini API
4. Backend parses/validates response
5. Frontend receives clean API response

This keeps API keys and prompt logic server-side.

## Requirements

### Frontend

- Node.js 18+
- npm

### Backend

- Python 3.11+ (3.13 also works in this repo)
- pip

## Environment Variables

### Frontend (`.env` in project root)

Required:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Optional:

- `VITE_BACKEND_URL` (default: `http://localhost:8000`)
- `VITE_IDLE_TIMEOUT_MINUTES` (default: `30`)

### Backend (`Backend/.env`)

Required:

- `GEMINI_API_KEY`

Optional:

- `FRONTEND_ORIGIN` (default: `http://localhost:5173`)
- `GEMINI_MODEL_TEXT` (default: `gemini-2.0-flash`)
- `GEMINI_MODEL_VIDEO` (default: `gemini-2.0-flash`)

## Local Development

Open two terminals.

### 1) Run frontend

From project root:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 2) Run backend

From project root:

```bash
cd Backend
python -m venv .venv
.\.venv\Scripts\activate
pip install fastapi uvicorn httpx pydantic pydantic-settings python-dotenv
cd ..
python -m uvicorn Backend.main:app --reload --port 8000
```

Backend docs: `http://localhost:8000/docs`

## API Reference

### `GET /health`

Response:

```json
{ "status": "ok" }
```

### `POST /api/analyze-form`

Request:

```json
{
  "base64Video": "BASE64_VIDEO_BYTES_WITHOUT_DATA_PREFIX",
  "mimeType": "video/webm"
}
```

Response:

```json
{
  "analysis": "Markdown coaching feedback..."
}
```

Notes:

- Max payload guard is enforced in backend
- `mimeType` must start with `video/`

### `POST /api/generate-routine`

Request:

```json
{
  "focusArea": "Draw shots from the rail"
}
```

Response:

```json
{
  "title": "string",
  "description": "string",
  "drills": [
    {
      "name": "string",
      "reps": "string",
      "instructions": "string",
      "youtubeSearchQuery": "string"
    },
    {
      "name": "string",
      "reps": "string",
      "instructions": "string",
      "youtubeSearchQuery": "string"
    },
    {
      "name": "string",
      "reps": "string",
      "instructions": "string",
      "youtubeSearchQuery": "string"
    }
  ]
}
```

Notes:

- Backend validates exactly 3 drills via Pydantic

## Project Scripts

From root:

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build

## Deployment Notes

- Deploy frontend and backend separately
- Set CORS `FRONTEND_ORIGIN` on backend to deployed frontend URL
- Set `VITE_BACKEND_URL` on frontend to deployed backend URL
- Keep `GEMINI_API_KEY` only on backend

## Troubleshooting

- `Missing Supabase environment variables`
  - Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist in root `.env`

- CORS errors calling backend
  - Set backend `FRONTEND_ORIGIN` to exact frontend origin

- Login works but dashboard does not hydrate
  - Verify Supabase tables/rows exist for the authenticated user:
    - `user_profile`
    - `locations`
    - `user_league_ratings`

- Gemini call failures (`502`)
  - Check backend `.env` has valid `GEMINI_API_KEY`
  - Check backend logs for provider/network errors
