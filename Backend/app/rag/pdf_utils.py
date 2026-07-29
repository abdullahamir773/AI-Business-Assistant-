"""
PDF text extraction + chunking.

Chunking = breaking a long document into small overlapping pieces,
so the AI can search and retrieve just the relevant piece instead of
reading the whole PDF every time.

Chunks are kept within page boundaries so we can always tell the user
exactly which page an answer came from.
"""
from pypdf import PdfReader


def extract_pages_from_pdf(file_path: str) -> list[str]:
    """Reads a PDF and returns a list of strings, one per page."""
    reader = PdfReader(file_path)
    return [page.extract_text() or "" for page in reader.pages]


def chunk_pages(pages: list[str], chunk_size: int = 1500, overlap: int = 300) -> list[dict]:
    """
    Splits each page's text into overlapping chunks, tagging every chunk
    with its page number (1-indexed).

    Returns: list of {"text": ..., "page": ...}
    """
    all_chunks = []

    for page_num, page_text in enumerate(pages, start=1):
        text = page_text.strip()
        if not text:
            continue

        start = 0
        text_length = len(text)

        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end].strip()
            if chunk:
                all_chunks.append({"text": chunk, "page": page_num})
            start += chunk_size - overlap

    return all_chunks


def extract_text_from_pdf(file_path: str) -> str:
    """Kept for convenience: full document text as one string (e.g. for summaries)."""
    return "\n".join(extract_pages_from_pdf(file_path))