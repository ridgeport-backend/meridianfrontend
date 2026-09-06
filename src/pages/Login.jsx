import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { loginUser } from "../lib/authClient.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || "/account";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Enter your email and password to continue.");
      return;
    }
    setSubmitting(true);
    try {
      const data = await loginUser({ email, password });
      login(data.user, data.token);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img
          src="https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-paper">
          <p className="font-display text-3xl leading-snug">
            Access your saved vehicles, orders, and support conversations in one place.
          </p>
          <p className="mt-4 text-sm text-paper/60">
            Meridian Motorcars · Premium pre-owned vehicles, worldwide.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-xl">Meridian</Link>
          <h1 className="mt-6 font-display text-2xl">Sign in to your account</h1>
          <p className="mt-1 text-sm text-steel">Access your cart, saved vehicles, and orders.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark"
              />
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-xs uppercase tracking-wide text-steel">Password</label>
                <Link to="/forgot-password" className="text-xs text-steel underline underline-offset-2 hover:text-ink dark:hover:text-paper">Forgot?</Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark"
              />
            </div>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ink px-6 py-3.5 text-sm text-paper transition hover:bg-inkSoft disabled:opacity-60 dark:bg-paper dark:text-ink"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-sm text-steel">
            Don't have an account? <Link to="/register" className="text-ink underline underline-offset-2 dark:text-paper">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
