# StudyBuddy Walkthrough

Hey hi, I am Copilot. This document gives a full walkthrough of the StudyBuddy project: what was updated, what is working, and how the app works end-to-end.

## 1) Project Overview

StudyBuddy is a full-stack AI study platform with:
- A React frontend (`studybuddy-frontend`) for workspace, flashcards, schedule, library, and voice interaction.
- A FastAPI backend (`studybuddy-backend`) for auth, upload, notes generation, chat, memory, voice, flashcards, schedule, and workspace APIs.
- Supabase (PostgreSQL) for relational persistence.
- Local FAISS vector store for retrieval-augmented generation (RAG) context.

## 2) Repo Structure

- `studybuddy-backend/`: API server, routes, services, schema SQL, integration tests.
- `studybuddy-frontend/`: React app (Vite), API client, UI components.
- `README.md`: high-level project summary.

## 3) Prerequisites

- Python 3.10+ (project currently tested via local `.venv`).
- Node.js 18+.
- Supabase project.
- API keys configured in backend `.env`.

Backend env variables required:
- `GROQ_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `ELEVENLABS_API_KEY` (for TTS if using ElevenLabs)

## 4) One-Time Setup

### 4.1 Backend setup (PowerShell)

```powershell
Set-Location studybuddy-backend
python -m venv .venv
.\.venv\Scripts\Activate
pip install -r requirements.txt
```

### 4.2 Supabase schema setup

Run `studybuddy-backend/supabase_schema.sql` in Supabase SQL Editor.

If only partial setup is needed:
- `studybuddy-backend/supabase_patch_flashcards.sql`
- `studybuddy-backend/supabase_patch_schedule_events.sql`

These scripts include `select pg_notify('pgrst', 'reload schema');` so PostgREST picks up table changes immediately.

### 4.3 Frontend setup (PowerShell)

```powershell
Set-Location studybuddy-frontend
npm install
```

## 5) Run Locally

### 5.1 Start backend

```powershell
Set-Location studybuddy-backend
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Health check:

```powershell
curl.exe http://localhost:8000/
```

Expected:

```json
{"status":"ok","message":"StudyBuddy API Running"}
```

### 5.2 Start frontend

```powershell
Set-Location studybuddy-frontend
npm run dev
```

Frontend API base defaults to `http://localhost:8000` unless `VITE_API_BASE_URL` is set.

## 6) End-to-End Product Walkthrough

### Step 1: Register or log in

Frontend calls:
- `POST /api/student/register`
- `POST /api/student/login`

Backend route: `studybuddy-backend/routes/student.py`

### Step 2: Initial app hydration

After login, `MainApp` fetches in parallel:
- memory greeting and sessions
- documents
- workspaces
- workspace-document links
- flashcards
- review stats
- schedule events
- talk history

Frontend file: `studybuddy-frontend/src/pages/MainApp.jsx## Screenshots

### Hero Section
![Hero — warm cream landing page](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/landing_hero_1781936125748.png)

### Features Grid — White cards with stone borders
![Features Grid — warm white cards](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/landing_scroll_3_1781936213418.png)

### Notebook Section — Paper-like warm feel
![Notebook Section](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/landing_scroll_4_1781936221891.png)

### AI Tutor Chat — Light chat UI
![AI Tutor Chat](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/landing_scroll_5_1781936230396.png)

### Adaptive Learning Progress
![Adaptive Learning Section](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/landing_scroll_7_1781936245953.png)

### Footer
![Footer](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/landing_scroll_9_footer_1781936259442.png)

### Portal Select — Light white portal cards
![Portal Select](/C:/Users/deeks/.gemini/antigravity-ide/brain/f660a037-7392-43df-9293-5b054a22631a/portal_select_1781936266867.png)ts`

### Step 3: Upload PDF resources

Frontend uploads PDF with form-data:
- `POST /api/upload`

Backend processes and stores:
- document metadata in Supabase
- vector index in local `studybuddy-backend/vectorstore/<student_id>/`

### Step 4: Generate notes

Frontend calls:
- `POST /api/notes/generate`

Modes supported include PDF context and search modes (web/research based on request payload).

### Step 5: Chat with Sensei

Frontend calls:
- `POST /api/chat`

Backend can use RAG context from uploaded resources. Chat history is persisted via backend services.

### Step 6: Voice interaction

Frontend VoiceOrb uses:
- `POST /api/voice/stt`
- `POST /api/voice/tts`

Voice Q/A is reflected in chat history state.

### Step 7: Flashcards workflow

APIs:
- `GET /api/flashcards/{student_id}`
- `POST /api/flashcards`
- `PATCH /api/flashcards/{student_id}/{flashcard_id}`
- `DELETE /api/flashcards/{student_id}/{flashcard_id}`
- `GET /api/flashcards/{student_id}/review-stats`
- `POST /api/flashcards/{student_id}/review-stats/increment`

New AI answer generation flow:
- `POST /api/flashcards/{student_id}/generate-answer`
- Backend retrieves context with `query_rag()` and generates answer with `generate_flashcard_answer()`.
- Frontend fills generated answer into create-card form before save.

### Step 8: Schedule workflow

APIs:
- `GET /api/schedule/{student_id}`
- `POST /api/schedule`
- `DELETE /api/schedule/{student_id}/{event_id}`

Validation:
- start and end time cannot be the same.
- overnight spans are represented in frontend timeline logic.

### Step 9: Workspaces and resource links

APIs:
- `GET /api/workspaces/{student_id}`
- `POST /api/workspaces`
- `DELETE /api/workspaces/{student_id}/{workspace_id}`
- `GET /api/workspaces/{student_id}/documents`
- `POST /api/workspaces/{student_id}/{workspace_id}/documents/{document_id}`
- `DELETE /api/workspaces/{student_id}/{workspace_id}/documents/{document_id}`

Behavior:
- backend ensures at least one workspace remains.
- frontend filters workspace resources from global library documents.

## 7) Recent Updates Included In This Branch

Backend updates:
- Added `FlashcardGenerateAnswerRequest` schema.
- Added flashcard AI answer generation endpoint.
- Added actionable Supabase table-missing error mapping (`PGRST205` -> clear setup guidance).
- Added schedule validation for equal start/end time.
- Added `generate_flashcard_answer()` in `llm_service.py`.
- Added PostgREST schema reload notify in SQL.        
- Added flashcards and schedule patch SQL scripts.

Frontend updates:
- `api.js` now normalizes backend errors with clearer user messages.
- `api.js` now supports `generateFlashcardAnswer()`.
- `MainApp.jsx` wires AI answer generation callback into flashcards view.
- `FlashcardsView.jsx` redesign:
  - AI Generate Answer button
  - front/back toggle controls
  - deck list and quick card selection
  - dynamic daily goal target
- `ScheduleView.jsx` redesign:
  - improved mission-control layout
  - weekly timeline board + monthly agenda
  - richer event visual states and delete controls

## 8) Verified Working Status

Validation snapshot performed locally:
- Backend integration scripts: `6/7` passing using `.venv`.
- Frontend production build: passing (`npm run build`).
- Editor diagnostic check: no immediate code errors.

Passing backend scripts:
- `test_student.py`
- `test_upload.py`
- `test_chat.py`
- `test_memory.py`
- `test_notes.py`
- `test_voice_tts.py`

Known failing script:
- `test_e2e.py`

Reason:
- It can fail at registration if the email already exists and its fallback condition does not match the current `409` message (`"Email already registered. Please log in."`).

## 9) Troubleshooting Guide

- Problem: `python -m uvicorn ...` says module not found.
  - Fix: use project interpreter: `.\.venv\Scripts\python.exe -m uvicorn main:app ...`

- Problem: API returns table-not-found (`PGRST205`).
  - Fix: run `studybuddy-backend/supabase_schema.sql` (recommended) or the patch SQL scripts.

- Problem: integration tests fail with connection refused.
  - Fix: wait until backend startup is complete, then verify `GET /` before running tests.

- Problem: `pytest` missing.
  - Note: this repo primarily uses script-based tests in `studybuddy-backend/tests/`.

## 10) Useful Test Commands

Run all backend integration scripts:

```powershell
Set-Location studybuddy-backend
.\.venv\Scripts\python.exe tests\run_all_tests.py
```

Run frontend build check:

```powershell
Set-Location studybuddy-frontend
npm run build
```

## 11) Hand-off Summary

Current state is stable for core workflows:
- auth, upload, notes, chat, memory, voice, flashcards, schedule, workspace links.
- new flashcard AI answer generation is wired backend + frontend.
- one end-to-end test script needs duplicate-email handling refinement.


## 12) Tech Stack

# StudyBuddy Tech Stack Walkthrough (Implemented Only)

This file lists only technologies that are currently implemented in this codebase.

## Group 1 - Core Language and Server (Backend)

| Technology | Role in project | Evidence in code |
|---|---|---|
| Python | Backend language | `studybuddy-backend/` source tree |
| FastAPI | REST API framework and routing | `studybuddy-backend/main.py`, `studybuddy-backend/routes/` |
| Uvicorn | ASGI server to run FastAPI | backend run command `uvicorn main:app` |
| Pydantic | Request/response models | `studybuddy-backend/models/schemas.py`, `studybuddy-backend/routes/exam.py`, `studybuddy-backend/routes/org.py` |
| python-multipart | File and form upload handling | `studybuddy-backend/routes/upload.py`, `studybuddy-backend/routes/voice.py`, `studybuddy-backend/routes/emotion.py` |
| python-dotenv | Loads .env into runtime config | `studybuddy-backend/config.py` |

## Group 2 - AI and LLM Layer

| Technology | Role in project | Evidence in code |
|---|---|---|
| LangChain | LLM/RAG orchestration base | `studybuddy-backend/services/llm_service.py`, `studybuddy-backend/services/rag_service.py` |
| langchain-groq | Groq connector for LLM calls | `studybuddy-backend/services/llm_service.py` |
| langchain-community | FAISS and embedding integrations | `studybuddy-backend/services/rag_service.py` |
| langchain-text-splitters | Chunking PDF text for RAG | `studybuddy-backend/services/rag_service.py` |
| httpx | HTTP client for model/audio API calls | `studybuddy-backend/services/stt_service.py`, `studybuddy-backend/services/tts_service.py` |

## Group 3 - Vector Search and Embeddings

| Technology | Role in project | Evidence in code |
|---|---|---|
| FAISS | Local vector index for retrieval | `studybuddy-backend/services/rag_service.py` |
| sentence-transformers | Embedding model package | `studybuddy-backend/services/rag_service.py` (`all-MiniLM-L6-v2`) |

## Group 4 - PDF Processing

| Technology | Role in project | Evidence in code |
|---|---|---|
| PyMuPDF (fitz) | Extract text from uploaded PDFs | `studybuddy-backend/services/rag_service.py` |

## Group 5 - Emotion Detection

| Technology | Role in project | Evidence in code |
|---|---|---|
| DeepFace | Emotion analysis from image frames | `studybuddy-backend/routes/emotion.py` |
| OpenCV (opencv-python-headless) | Decode and preprocess uploaded frames | `studybuddy-backend/routes/emotion.py` |
| tf-keras | DeepFace runtime dependency | listed in `studybuddy-backend/requirements.txt` |

## Group 6 - Database

| Technology | Role in project | Evidence in code |
|---|---|---|
| Supabase Python Client | Backend database access layer | `studybuddy-backend/services/supabase_service.py` |

## Group 7 - External APIs Called From Backend

| Service | Role in project | Evidence in code |
|---|---|---|
| Groq API (LLM) | Chat and content generation | `studybuddy-backend/services/llm_service.py` |
| Groq API (STT) | Whisper transcription | `studybuddy-backend/services/stt_service.py` |
| Groq API (TTS) | Speech synthesis | `studybuddy-backend/services/tts_service.py` |
| HuggingFace Hub (indirect) | Model download used by sentence-transformers | triggered by embedding init in `studybuddy-backend/services/rag_service.py` |

## Group 8 - Frontend Layer

| Technology | Role in project | Evidence in code |
|---|---|---|
| React | UI framework | `studybuddy-frontend/src/` |
| Vite | Build tool and dev server | `studybuddy-frontend/vite.config.js`, `studybuddy-frontend/package.json` scripts |
| Tailwind CSS | Utility CSS styling | `studybuddy-frontend/src/index.css`, `studybuddy-frontend/postcss.config.js` |
| React Router DOM | Routing and guarded routes | `studybuddy-frontend/src/App.jsx` |
| Supabase JS Client | Frontend OAuth/auth session integration | `studybuddy-frontend/src/lib/supabase.js`, `studybuddy-frontend/src/pages/Landing.jsx`, `studybuddy-frontend/src/pages/AuthCallback.jsx` |

## Group 9 - Authentication and Security

| Technology | Role in project | Evidence in code |
|---|---|---|
| Supabase Auth (Google OAuth) | Student Google login flow | `studybuddy-frontend/src/pages/Landing.jsx`, `studybuddy-frontend/src/pages/AuthCallback.jsx` |
| hashlib (SHA-256) | Hashing org/teacher passwords | `studybuddy-backend/routes/org.py` |

## Group 10 - Background Jobs and Email

| Technology | Role in project | Evidence in code |
|---|---|---|
| asyncio | Background scheduler loop | `studybuddy-backend/services/scheduler_job.py` |
| smtplib | SMTP email sending | `studybuddy-backend/services/email_service.py` |
| email.mime | HTML email formatting | `studybuddy-backend/services/email_service.py` |

Implementation note: scheduler check interval is 300 seconds (5 minutes) and sends reminders for events around 30 minutes ahead.

## Group 11 - Developer Tools Used in This Repo

| Technology | Role in project | Evidence in code/config |
|---|---|---|
| GitHub/Git | Version control and PR workflow | `.git/` repo and remotes |
| Swagger UI (FastAPI docs) | API inspection and testing at runtime | FastAPI app in `studybuddy-backend/main.py` (available at `/docs`) |
| npm | Frontend package management and scripts | `studybuddy-frontend/package.json` |
| pip | Backend package management | `studybuddy-backend/requirements.txt` |
| requests | Integration test HTTP client | `studybuddy-backend/tests/` |



## 13) Direct Demo Access (Judges)
To streamline evaluation, we have hardcoded one-click "Direct Demo Access" buttons on the Portal Selection (/get-started) screen using predefined demo accounts:
- Student: dgowdagr01@gmail.com
- Teacher: dgowdagr02@gmail.com
- Organization: dgowdagr03@gmail.com

