import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (!email) return;
    // In production this calls POST /api/auth/forgot-password.
    setSent(true);
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link to="/" className="font-display text-xl">Meridian</Link>
        <h1 className="mt-6 font-display text-2xl">Reset your password</h1>
        {sent ? (
          <p className="mt-4 text-sm text-steel">
            If an account exists for {email}, we've sent a link to reset your password.
          </p>
        ) : (
          <>
            <p className="mt-1 text-sm text-steel">Enter your email and we'll send you a reset link.</p>
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark"
              />
              <button type="submit" className="w-full bg-ink px-6 py-3.5 text-sm text-paper transition hover:bg-inkSoft dark:bg-paper dark:text-ink">
                Send Reset Link
              </button>
            </form>
          </>
        )}
        <p className="mt-6 text-sm text-steel">
          <Link to="/login" className="text-ink underline underline-offset-2 dark:text-paper">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
