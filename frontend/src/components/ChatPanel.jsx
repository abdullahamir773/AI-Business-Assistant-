import { useEffect, useRef, useState } from "react";

export default function ChatPanel({ messages, onSend, sending, hasDocuments }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setInput("");
  }

  return (
    <main className="chat-panel">
      <div className="chat-scroll" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="chat-empty">
            <div className="chat-empty-mark">✦</div>
            <h2>Ask anything about your documents</h2>
            <p>
              {hasDocuments
                ? "Your documents are ready. Ask a specific question and I'll answer using only what's inside them."
                : "Upload a PDF from the sidebar first, then ask a question about it here."}
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {sending && (
          <div className="msg-row assistant">
            <div className="msg-bubble assistant typing">
              <span className="typing-dot" />
              <span className="typing-dot" />
              <span className="typing-dot" />
            </div>
          </div>
        )}
      </div>

      <form className="chat-input-bar" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={hasDocuments ? "Ask a question about your documents…" : "Upload a document to get started…"}
          disabled={sending}
        />
        <button type="submit" disabled={sending || !input.trim()} title="Send">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12l16-8-6 8 6 8-16-8z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinejoin="round"
              fill="currentColor"
            />
          </svg>
        </button>
      </form>
    </main>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === "user";
  return (
    <div className={`msg-row ${isUser ? "user" : "assistant"}`}>
      <div className={`msg-bubble ${isUser ? "user" : "assistant"}`}>
        <div className="msg-text">{message.content}</div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="msg-sources">
            {message.sources.map((src) => (
              <span className="source-pill" key={src}>
                {src}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
