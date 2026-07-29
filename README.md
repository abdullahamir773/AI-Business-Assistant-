# Marginal — AI Business Assistant (RAG-powered)

An AI-powered business assistant that lets companies upload internal documents (PDFs) and get accurate, grounded answers to questions about them — instead of digging through pages manually or relying on an AI that makes things up.

Built as a full-stack portfolio project covering authentication, a RAG (Retrieval-Augmented Generation) pipeline, and a custom-designed React frontend.

## Why this project

Most "ChatGPT wrapper" projects just forward a prompt to an LLM. This one implements the full RAG pipeline from scratch:

- PDFs are parsed, chunked, and embedded locally (no API cost for embeddings)
- Chunks are stored per-user in a vector database (ChromaDB), so one user's documents are never visible to another
- When a question is asked, only the most relevant chunks are retrieved and passed to the LLM as context
- The LLM is instructed to answer **only** from that context — if the answer isn't in the documents, it says so instead of guessing

## Features

- 🔐 **Authentication** — JWT-based signup/login, passwords hashed with bcrypt, email-based password reset
- 📄 **PDF upload & processing** — text extraction, page-aware chunking, and embedding on upload
- 📝 **Auto-generated document summaries** — get a quick overview the moment a document finishes processing
- 💬 **Grounded Q&A chat** — answers are generated only from the user's uploaded documents, with page-level source citations
- 🌐 **Embeddable website widget** — a single `<script>` tag lets any business drop a working chat assistant onto their own site, answering visitor questions from their documents with no login required
- 🗂 **Document management** — view processing status, delete documents
- 🕓 **Persistent chat history** — conversations are saved per user
- 🎨 **Custom-designed frontend** — no template UI; a distinct "Ink & Paper" visual identity with animated interactions

## Tech Stack

**Backend**
- FastAPI (Python)
- PostgreSQL + SQLAlchemy
- JWT authentication (python-jose, passlib/bcrypt)
- ChromaDB (vector database)
- Sentence-Transformers (`all-MiniLM-L6-v2`) for embeddings — runs locally, no API cost
- Groq (Llama 3.3 70B) for answer generation

**Frontend**
- React + Vite
- React Router
- Axios
- Custom CSS (no UI framework) — Fraunces + Inter + JetBrains Mono type system

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌──────────────────┐
│   React     │─────▶│   FastAPI    │─────▶│   PostgreSQL      │
│  Frontend   │◀─────│   Backend    │◀─────│  (users, chats,   │
└─────────────┘      └──────┬───────┘      │   doc metadata)   │
                             │              └──────────────────┘
                             ▼
                      ┌──────────────┐      ┌──────────────────┐
                      │  ChromaDB    │      │  Groq API         │
                      │ (embeddings, │      │ (Llama 3.3 70B —  │
                      │  per user)   │      │  answer generation)│
                      └──────────────┘      └──────────────────┘
```

**RAG flow:** PDF upload → text extraction (pypdf) → chunking (1500 chars, 300 overlap) → embeddings (Sentence-Transformers) → stored in ChromaDB → on question, top-8 relevant chunks retrieved → passed to Groq LLM with a strict "answer only from context" system prompt → response + source citations returned to the user.

## Project Structure

```
ai-business-assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entrypoint
│   │   ├── config.py            # Environment config
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models.py            # User, Document, ChatMessage
│   │   ├── schemas.py           # Pydantic request/response schemas
│   │   ├── auth_utils.py        # Password hashing, JWT
│   │   ├── deps.py              # Auth dependency (get_current_user)
│   │   ├── rag/
│   │   │   ├── pdf_utils.py     # Text extraction + chunking
│   │   │   ├── vector_store.py  # ChromaDB operations
│   │   │   └── llm.py           # LLM call (Groq)
│   │   └── routers/
│   │       ├── auth.py          # /auth/signup, /auth/login, /auth/me
│   │       ├── documents.py     # /documents/upload, list, delete
│   │       └── chat.py          # /chat/ask, /chat/history
│   └── requirements.txt
└── frontend/
    └── src/
        ├── pages/                # Login, Signup, Dashboard
        ├── components/           # Sidebar, ChatPanel, ProtectedRoute
        └── context/              # AuthContext
```

## Setup

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # Mac/Linux
pip install -r requirements.txt
cp .env.example .env         # then fill in DATABASE_URL, SECRET_KEY, GROQ_API_KEY
uvicorn app.main:app --reload
```

API docs available at `http://localhost:8000/docs`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`.

## Screenshots

<img width="958" height="410" alt="image" src="https://github.com/user-attachments/assets/72a0d3d2-0d70-4bc4-bf3e-1ad9bf0b2675" />

## What I'd improve next

- Support for more file types (Word, Excel, plain text)
- Streaming responses (token-by-token, like ChatGPT) instead of waiting for the full answer
- Better handling of very large documents (currently chunked at upload time; could add background processing queue)
- Deployment with persistent vector storage (current setup assumes a persistent disk for ChromaDB)

## Author

Muhammad Abdullah — BSCS student, AI/ML & full-stack developer
