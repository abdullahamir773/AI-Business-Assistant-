import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import Sidebar from "../components/Sidebar";
import ChatPanel from "../components/ChatPanel";
import "./Dashboard.css";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const loadDocuments = useCallback(async () => {
    try {
      const res = await api.get("/documents/");
      setDocuments(res.data);
    } catch {
      // silently ignore; sidebar will just show empty state
    } finally {
      setLoadingDocs(false);
    }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const res = await api.get("/chat/history");
      setMessages(res.data.map((m) => ({ role: m.role, content: m.content })));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadDocuments();
    loadHistory();
  }, [loadDocuments, loadHistory]);

  // Poll while any document is still "processing"
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.status === "processing");
    if (!hasProcessing) return;
    const interval = setInterval(loadDocuments, 2500);
    return () => clearInterval(interval);
  }, [documents, loadDocuments]);

  async function handleUpload(file) {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await api.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDocuments((prev) => [res.data, ...prev]);
    } catch (err) {
      alert(err.response?.data?.detail || "Upload failed. Please try again.");
    }
  }

  async function handleDelete(docId) {
    const prev = documents;
    setDocuments((d) => d.filter((doc) => doc.id !== docId));
    try {
      await api.delete(`/documents/${docId}`);
    } catch {
      setDocuments(prev); // roll back on failure
    }
  }

  async function handleSend(text) {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setSending(true);
    try {
      const res = await api.post("/chat/ask", { message: text });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.answer, sources: res.data.sources },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            err.response?.data?.detail ||
            "Something went wrong reaching the assistant. Please try again.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const readyDocs = documents.some((d) => d.status === "ready");

  return (
    <div className="dashboard">
      <Sidebar
        user={user}
        documents={documents}
        loadingDocs={loadingDocs}
        onUpload={handleUpload}
        onDelete={handleDelete}
        onLogout={handleLogout}
      />
      <ChatPanel
        messages={messages}
        onSend={handleSend}
        sending={sending}
        hasDocuments={readyDocs}
      />
    </div>
  );
}

