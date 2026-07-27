# AI Business Assistant — Backend (Phase 1: Auth + DB)

## Setup

1. **PostgreSQL install/run karo** (agar nahi hai to local install karo, ya Docker se run karo):
   ```bash
   docker run --name pg -e POSTGRES_PASSWORD=password -e POSTGRES_DB=ai_business_assistant -p 5432:5432 -d postgres
   ```

2. **Virtual environment + dependencies:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate      # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

3. **.env file banao:**
   ```bash
   cp .env.example .env
   # .env kholke DATABASE_URL aur SECRET_KEY set karo
   ```

4. **Server run karo:**
   ```bash
   uvicorn app.main:app --reload
   ```

5. **Swagger docs kholo:** http://localhost:8000/docs
   Yahan se `/auth/signup` aur `/auth/login` test kar sakte ho directly browser me.

## Endpoints (Phase 1)

| Method | Route          | Description                          |
|--------|----------------|---------------------------------------|
| POST   | `/auth/signup` | New user register, token return karta hai |
| POST   | `/auth/login`  | Login, token return karta hai          |
| GET    | `/auth/me`     | Current user info (token required, header: `Authorization: Bearer <token>`) |

## Project Structure

```
backend/
  app/
    main.py          # App entrypoint, CORS, router registration
    config.py         # Env variables (.env se read)
    database.py       # SQLAlchemy engine + session
    models.py          # DB tables: User, Document, ChatMessage
    schemas.py          # Request/response validation
    auth_utils.py         # Password hashing + JWT
    deps.py                # get_current_user dependency
    routers/
      auth.py               # signup/login/me routes
  requirements.txt
  .env.example
```

`Document` aur `ChatMessage` models already bana diye hain (empty tables abhi) — Phase 2 aur 3 me inko use karenge, isliye migration dobara nahi karni padegi.

## Tested ✅
Signup, login, protected `/auth/me`, wrong password (401), duplicate email (400), no-token access (401) — sab manually test kar liya hai, sab sahi kaam kar raha hai.

## Next (Phase 2)
- PDF upload endpoint
- Text extraction + chunking
- Embeddings + ChromaDB/FAISS
- LangChain retrieval + LLM answer generation
