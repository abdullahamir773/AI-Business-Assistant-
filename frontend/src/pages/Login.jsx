import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Couldn't sign in. Check your details and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-form-card">
          <h2>Welcome back</h2>
          <p className="subtitle">Sign in to keep working with your documents.</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <button className="btn-primary" type="submit" disabled={loading}>
              {loading && <span className="spinner" />}
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="auth-switch">
            New here? <Link to="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function BrandPanel() {
  return (
    <div className="auth-brand">
      <div className="auth-brand-mark">
        <span className="dot" />
        Marginal
      </div>

      <div className="auth-brand-hero">
        <h1>
          Ask your documents. <span className="accent">Get real answers.</span>
        </h1>

        <div className="doc-mock">
          <div className="line w-90 highlight-target" />
          <div className="line w-75" />
          <div className="line w-85" />
          <div className="line w-60" />
          <div className="answer-chip">✓ Answered from Q3-Policy.pdf</div>
        </div>
      </div>

      <div className="auth-brand-foot">AI Business Assistant · RAG-powered</div>
    </div>
  );
}
