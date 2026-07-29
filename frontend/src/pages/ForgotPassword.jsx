import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { BrandPanel } from "./Login";
import "./Auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {sent ? (
            <>
              <h2>Check your email</h2>
              <p className="subtitle">
                If an account exists for <strong>{email}</strong>, we've sent a link to reset
                your password. It expires in 30 minutes.
              </p>
              <p className="auth-switch">
                <Link to="/login">Back to sign in</Link>
              </p>
            </>
          ) : (
            <>
              <h2>Forgot your password?</h2>
              <p className="subtitle">
                Enter your email and we'll send you a link to reset it.
              </p>

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
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Sending…" : "Send reset link"}
                </button>
              </form>

              <p className="auth-switch">
                <Link to="/login">Back to sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}