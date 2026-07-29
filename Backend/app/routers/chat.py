"""
Chat routes: /chat/ask (ask a question about your documents), /chat/history
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user
from app.rag.vector_store import query_relevant_chunks
from app.rag.llm import generate_answer

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/ask", response_model=schemas.ChatResponse)
def ask_question(
    payload: schemas.ChatRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    user_msg = models.ChatMessage(role="user", content=payload.message, user_id=current_user.id)
    db.add(user_msg)
    db.commit()

    relevant_chunks = query_relevant_chunks(current_user.id, payload.message)

    recent_messages = (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.desc())
        .limit(10)
        .all()
    )
    history = [{"role": m.role, "content": m.content} for m in reversed(recent_messages)]

    answer = generate_answer(payload.message, relevant_chunks, history)

    assistant_msg = models.ChatMessage(role="assistant", content=answer, user_id=current_user.id)
    db.add(assistant_msg)
    db.commit()

    sources = sorted({f"{c['filename']} (p.{c['page']})" for c in relevant_chunks})
    return schemas.ChatResponse(answer=answer, sources=sources)


@router.get("/history", response_model=list[schemas.ChatMessageOut])
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.ChatMessage)
        .filter(models.ChatMessage.user_id == current_user.id)
        .order_by(models.ChatMessage.created_at.asc())
        .all()
    )


@router.delete("/history")
def clear_chat_history(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.ChatMessage).filter(models.ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"detail": "Chat history cleared"}