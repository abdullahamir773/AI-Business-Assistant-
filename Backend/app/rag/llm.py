"""
Calls Groq (fast, free LLM hosting) to generate answers and summaries,
using ONLY the retrieved document chunks as context — this is what makes
it "RAG" (Retrieval-Augmented Generation) instead of the AI just making
things up.
"""
from groq import Groq

from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

MODEL = "llama-3.3-70b-versatile"

SYSTEM_INSTRUCTIONS = """You are a helpful business assistant. You must answer the
user's question using ONLY the information in the "Context" section below.

Rules:
- If the answer is not in the context, say clearly that the documents don't
  contain that information. Do NOT make up an answer.
- Be concise and professional.
- If helpful, mention which document (and page) the info came from.
"""


def generate_answer(question: str, context_chunks: list[dict], chat_history: list[dict] | None = None) -> str:
    if not context_chunks:
        return (
            "I don't have any documents to search yet. Please upload a PDF first, "
            "then ask me questions about it."
        )

    context_text = "\n\n".join(
        f"[From: {c['filename']}, page {c['page']}]\n{c['text']}" for c in context_chunks
    )

    messages = [{"role": "system", "content": f"{SYSTEM_INSTRUCTIONS}\n\nContext:\n{context_text}"}]

    if chat_history:
        for m in chat_history[-6:]:
            messages.append(
                {"role": m["role"] if m["role"] in ("user", "assistant") else "user", "content": m["content"]}
            )

    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(model=MODEL, messages=messages, temperature=0.3)
    return response.choices[0].message.content


def generate_summary(text: str, filename: str) -> str:
    """
    Generates a short 2-4 sentence summary of a newly uploaded document,
    shown to the user right after upload so they immediately know what's
    inside without having to ask.
    """
    trimmed = text[:6000]

    messages = [
        {
            "role": "system",
            "content": (
                "You summarize business documents. Write a clear, professional summary "
                "in 2-4 sentences covering what the document is and its key points. "
                "Do not use markdown formatting."
            ),
        },
        {"role": "user", "content": f"Document filename: {filename}\n\nContent:\n{trimmed}"},
    ]

    response = client.chat.completions.create(model=MODEL, messages=messages, temperature=0.3)
    return response.choices[0].message.content