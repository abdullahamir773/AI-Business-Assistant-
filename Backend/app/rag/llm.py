"""
Calls Groq (fast, free LLM hosting) to generate an answer, using ONLY the
retrieved document chunks as context — this is what makes it "RAG"
(Retrieval-Augmented Generation) instead of the AI just making things up.
"""
from groq import Groq

from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

SYSTEM_INSTRUCTIONS = """You are a helpful business assistant. You must answer the
user's question using ONLY the information in the "Context" section below.

Rules:
- If the answer is not in the context, say clearly that the documents don't
  contain that information. Do NOT make up an answer.
- Be concise and professional.
- If helpful, mention which document the info came from.
"""


def generate_answer(question: str, context_chunks: list[dict], chat_history: list[dict] | None = None) -> str:
    """
    question: the user's question
    context_chunks: list of {"text": ..., "filename": ...} from vector search
    chat_history: optional list of {"role": "user"|"assistant", "content": ...}
    """
    if not context_chunks:
        return (
            "I don't have any documents to search yet. Please upload a PDF first, "
            "then ask me questions about it."
        )

    context_text = "\n\n".join(
        f"[From: {c['filename']}]\n{c['text']}" for c in context_chunks
    )

    messages = [{"role": "system", "content": f"{SYSTEM_INSTRUCTIONS}\n\nContext:\n{context_text}"}]

    if chat_history:
        for m in chat_history[-6:]:
            messages.append({"role": m["role"] if m["role"] in ("user", "assistant") else "user", "content": m["content"]})

    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
    )
    return response.choices[0].message.content