import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api";
import { BrandPanel } from "./Login";
import "./Auth.css";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", { token, new_password: password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.detail || "This reset link is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="auth-screen">
        <BrandPanel />
        <div className="auth-form-panel">
          <div className="auth-form-card">
            <h2>Invalid link</h2>
            <p className="subtitle">
              This password reset link is missing its token. Please request a new one.
            </p>
            <p className="auth-switch">
              <Link to="/forgot-password">Request a new link</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-screen">
      <BrandPanel />
      <div className="auth-form-panel">
        <div className="auth-form-card">
          {done ? (
            <>
              <h2>Password updated</h2>
              <p className="subtitle">Redirecting you to sign in…</p>
            </>
          ) : (
            <>
              <h2>Set a new password</h2>
              <p className="subtitle">Choose a new password for your account.</p>

              {error && <div className="form-error">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label htmlFor="password">New password</label>
                  <input
                    id="password"
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                  />
                </div>
                <div className="field">
                  <label htmlFor="confirmPassword">Confirm new password</label>
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                  />
                </div>
                <button className="btn-primary" type="submit" disabled={loading}>
                  {loading && <span className="spinner" />}
                  {loading ? "Updating…" : "Update password"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}