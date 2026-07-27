"""
PDF text extraction + chunking.

Chunking = breaking a long document into small overlapping pieces,
so the AI can search and retrieve just the relevant piece instead of
reading the whole PDF every time.
"""
from pypdf import PdfReader


def extract_text_from_pdf(file_path: str) -> str:
    """Reads a PDF file and returns all its text as one big string."""
    reader = PdfReader(file_path)
    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text() or ""
        text_parts.append(page_text)
    return "\n".join(text_parts)


def chunk_text(text: str, chunk_size: int = 1500, overlap: int = 300) -> list[str]:
    """
    Splits text into overlapping chunks (by characters).

    chunk_size = how big each chunk is
    overlap    = how much consecutive chunks share, so we don't cut
                 a sentence/idea awkwardly in half
    """
    text = text.strip()
    if not text:
        return []

    chunks = []
    start = 0
    text_length = len(text)

    while start < text_length:
        end = start + chunk_size
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start += chunk_size - overlap

    return chunks