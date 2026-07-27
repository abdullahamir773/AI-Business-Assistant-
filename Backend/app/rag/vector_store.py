"""
Vector store (ChromaDB) — stores document chunks as embeddings so we can
search "which chunks are most relevant to this question" later.

Each user gets their own ChromaDB "collection" (like a private table),
identified by user_id, so one user never sees another user's documents.
"""
import chromadb
from chromadb.utils import embedding_functions

# Free, local embedding model — no API key needed.
embedding_fn = embedding_functions.SentenceTransformerEmbeddingFunction(
    model_name="all-MiniLM-L6-v2"
)

# Persistent client = data survives server restarts (saved to disk).
chroma_client = chromadb.PersistentClient(path="./chroma_db")


def get_user_collection(user_id: str):
    """Each user has their own isolated collection of document chunks."""
    return chroma_client.get_or_create_collection(
        name=f"user_{user_id}",
        embedding_function=embedding_fn,
    )


def add_document_chunks(user_id: str, document_id: str, filename: str, chunks: list[str]):
    """Embeds and stores chunks for one uploaded document."""
    if not chunks:
        return

    collection = get_user_collection(user_id)
    ids = [f"{document_id}_{i}" for i in range(len(chunks))]
    metadatas = [{"document_id": document_id, "filename": filename, "chunk_index": i} for i in range(len(chunks))]

    collection.add(ids=ids, documents=chunks, metadatas=metadatas)


def query_relevant_chunks(user_id: str, question: str, top_k: int = 8) -> list[dict]:
    """
    Finds the most relevant chunks (across ALL of this user's documents)
    for a given question.
    """
    collection = get_user_collection(user_id)

    if collection.count() == 0:
        return []

    results = collection.query(query_texts=[question], n_results=min(top_k, collection.count()))

    chunks = []
    documents = results.get("documents", [[]])[0]
    metadatas = results.get("metadatas", [[]])[0]

    for doc_text, meta in zip(documents, metadatas):
        chunks.append({"text": doc_text, "filename": meta.get("filename", "unknown")})

    return chunks


def delete_document_chunks(user_id: str, document_id: str):
    """Removes all chunks belonging to one document (e.g. when user deletes a PDF)."""
    collection = get_user_collection(user_id)
    collection.delete(where={"document_id": document_id})