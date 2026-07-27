"""
Document routes: upload PDF, list documents, delete document.
"""
import os
import uuid

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas
from app.deps import get_current_user
from app.rag.pdf_utils import extract_text_from_pdf, chunk_text
from app.rag.vector_store import add_document_chunks, delete_document_chunks

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = "uploaded_pdfs"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload", response_model=schemas.DocumentOut)
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    safe_name = f"{uuid.uuid4()}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    with open(file_path, "wb") as f:
        f.write(file.file.read())

    document = models.Document(
        filename=file.filename,
        file_path=file_path,
        status="processing",
        owner_id=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    try:
        text = extract_text_from_pdf(file_path)
        chunks = chunk_text(text)

        if not chunks:
            document.status = "failed"
            db.commit()
            raise HTTPException(
                status_code=400,
                detail="Could not extract any text from this PDF (it may be scanned/image-based).",
            )

        add_document_chunks(
            user_id=current_user.id,
            document_id=document.id,
            filename=file.filename,
            chunks=chunks,
        )
        document.status = "ready"
        db.commit()
        db.refresh(document)

    except HTTPException:
        raise
    except Exception as e:
        document.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process PDF: {str(e)}")

    return document


@router.get("/", response_model=list[schemas.DocumentOut])
def list_documents(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    return (
        db.query(models.Document)
        .filter(models.Document.owner_id == current_user.id)
        .order_by(models.Document.uploaded_at.desc())
        .all()
    )


@router.delete("/{document_id}")
def delete_document(
    document_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    document = (
        db.query(models.Document)
        .filter(models.Document.id == document_id, models.Document.owner_id == current_user.id)
        .first()
    )
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")

    delete_document_chunks(current_user.id, document.id)
    if os.path.exists(document.file_path):
        os.remove(document.file_path)
    db.delete(document)
    db.commit()

    return {"detail": "Document deleted"}