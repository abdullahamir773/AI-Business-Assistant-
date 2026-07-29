"""
Widget routes:
- /widget/info      (protected)  — get/create this user's public widget key
- /widget/regenerate (protected) — invalidate the old key, issue a new one
- /public/chat/{widget_key}/ask (public, no login) — used by the embedded
  widget script on a business's own website.
"""
import secrets

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user
from app.rag.vector_store import query_relevant_chunks
from app.rag.llm import generate_answer

router = APIRouter(tags=["Widget"])


def _generate_key() -> str:
    return "wgt_" + secrets.token_urlsafe(24)


@router.get("/widget/info", response_model=schemas.WidgetInfo)
def get_widget_info(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not current_user.widget_key:
        current_user.widget_key = _generate_key()
        db.commit()
    return schemas.WidgetInfo(widget_key=current_user.widget_key)


@router.post("/widget/regenerate", response_model=schemas.WidgetInfo)
def regenerate_widget_key(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    current_user.widget_key = _generate_key()
    db.commit()
    return schemas.WidgetInfo(widget_key=current_user.widget_key)


@router.post("/public/chat/{widget_key}/ask", response_model=schemas.ChatResponse)
def public_ask_question(
    widget_key: str,
    payload: schemas.PublicChatRequest,
    db: Session = Depends(get_db),
):
    owner = db.query(models.User).filter(models.User.widget_key == widget_key).first()
    if not owner:
        raise HTTPException(status_code=404, detail="Invalid widget key")

    message = payload.message.strip()
    if not message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    if len(message) > 2000:
        raise HTTPException(status_code=400, detail="Message is too long")

    relevant_chunks = query_relevant_chunks(owner.id, message)
    answer = generate_answer(message, relevant_chunks, chat_history=None)

    sources = sorted({f"{c['filename']} (p.{c['page']})" for c in relevant_chunks})
    return schemas.ChatResponse(answer=answer, sources=sources)