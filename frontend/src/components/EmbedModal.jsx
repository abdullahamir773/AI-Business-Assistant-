import { useEffect, useState } from "react";
import api from "../api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function EmbedModal({ onClose }) {
  const [widgetKey, setWidgetKey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    api
      .get("/widget/info")
      .then((res) => setWidgetKey(res.data.widget_key))
      .finally(() => setLoading(false));
  }, []);

  const snippet = widgetKey
    ? `<script src="${API_BASE_URL}/static/widget.js" data-key="${widgetKey}"></script>`
    : "";

  function copySnippet() {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function regenerateKey() {
    if (!confirm("This will invalidate your current widget. Any site using the old code will stop working. Continue?")) {
      return;
    }
    setRegenerating(true);
    try {
      const res = await api.post("/widget/regenerate");
      setWidgetKey(res.data.widget_key);
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div className="embed-overlay" onClick={onClose}>
      <div className="embed-modal" onClick={(e) => e.stopPropagation()}>
        <div className="embed-modal-header">
          <h3>Embed on your website</h3>
          <button className="embed-close" onClick={onClose}>×</button>
        </div>

        <p className="embed-desc">
          Paste this snippet before the closing <code>&lt;/body&gt;</code> tag on your site. A
          chat bubble will appear that answers visitor questions using your uploaded documents —
          no login required for them.
        </p>

        {loading ? (
          <div className="embed-loading">Loading…</div>
        ) : (
          <>
            <div className="embed-code-block">
              <code>{snippet}</code>
              <button className="embed-copy-btn" onClick={copySnippet}>
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            <div className="embed-footer">
              <span className="embed-key-label">
                Widget key: <code>{widgetKey}</code>
              </span>
              <button className="embed-regenerate" onClick={regenerateKey} disabled={regenerating}>
                {regenerating ? "Regenerating…" : "Regenerate key"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}