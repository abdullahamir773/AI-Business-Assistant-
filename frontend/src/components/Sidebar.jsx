import { useRef, useState } from "react";
import EmbedModal from "./EmbedModal";

export default function Sidebar({
  user,
  documents,
  loadingDocs,
  onUpload,
  onDelete,
  onLogout,
}) {
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [showEmbed, setShowEmbed] = useState(false);

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      alert("Only PDF files are supported.");
      return;
    }
    setUploading(true);
    try {
      await onUpload(file);
    } finally {
      setUploading(false);
    }
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="dot" />
        Marginal
      </div>

      <div
        className={`upload-zone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <span className="spinner dark" />
            <span>Reading document…</span>
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 4v12m0-12l-4 4m4-4l4 4M5 18v1a2 2 0 002 2h10a2 2 0 002-2v-1"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Drop a PDF, or click to upload</span>
          </>
        )}
      </div>

      <div className="doc-list-label">Your documents</div>
      <div className="doc-list">
        {loadingDocs && <div className="doc-list-empty">Loading…</div>}

        {!loadingDocs && documents.length === 0 && (
          <div className="doc-list-empty">
            Nothing here yet. Upload a PDF to start asking questions about it.
          </div>
        )}

        {documents.map((doc, i) => (
          <div key={doc.id} style={{ animationDelay: `${i * 40}ms` }} className="doc-item-wrap">
            <div
              className="doc-item"
              onClick={() => doc.summary && setExpandedId(expandedId === doc.id ? null : doc.id)}
              style={{ cursor: doc.summary ? "pointer" : "default" }}
            >
              <div className="doc-item-icon">📄</div>
              <div className="doc-item-info">
                <div className="doc-item-name" title={doc.filename}>
                  {doc.filename}
                </div>
                <div className={`doc-item-status status-${doc.status}`}>
                  {doc.status === "ready" && "Ready"}
                  {doc.status === "processing" && "Processing…"}
                  {doc.status === "failed" && "Failed"}
                </div>
              </div>
              <button
                className="doc-item-delete"
                title="Delete document"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(doc.id);
                }}
              >
                ×
              </button>
            </div>
            {expandedId === doc.id && doc.summary && (
              <div className="doc-item-summary">{doc.summary}</div>
            )}
          </div>
        ))}
      </div>
      <button className="sidebar-embed-btn" onClick={() => setShowEmbed(true)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 18l6-6-6-6M8 6l-6 6 6 6"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Embed on your website
      </button>

      {showEmbed && <EmbedModal onClose={() => setShowEmbed(false)} />}

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">
          {(user?.full_name || user?.email || "?").charAt(0).toUpperCase()}
        </div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user?.full_name || "Account"}</div>
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
        <button className="sidebar-logout" title="Sign out" onClick={onLogout}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}