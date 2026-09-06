import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { registerUser } from "../lib/authClient.js";

function passwordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–4
}

const strengthLabel = ["Too short", "Weak", "Fair", "Good", "Strong"];

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const strength = passwordStrength(form.password);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.password) {
      setError("Fill in your name, email, and a password to continue.");
      return;
    }
    if (form.password.length < 8) {
      setError("Your password needs to be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Those passwords don't match.");
      return;
    }
    if (!agreed) {
      setError("You'll need to agree to the Privacy Policy to create an account.");
      return;
    }

    setSubmitting(true);
    try {
      const data = await registerUser({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      login(data.user, data.token);
      navigate("/account", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-ink lg:block">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80"
          alt=""
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col justify-end p-12 text-paper">
          <p className="font-display text-3xl leading-snug">
            Create an account to save vehicles, track orders, and check out faster.
          </p>
          <p className="mt-4 text-sm text-paper/60">Meridian Motorcars · Premium pre-owned vehicles, worldwide.</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-display text-xl">Meridian</Link>
          <h1 className="mt-6 font-display text-2xl">Create your account</h1>
          <p className="mt-1 text-sm text-steel">Takes less than a minute.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4" noValidate>
            <div>
              <label htmlFor="name" className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Full name</label>
              <input id="name" placeholder="Jordan Ade" value={form.name} onChange={update("name")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
            </div>
            <div>
              <label htmlFor="reg-email" className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Email</label>
              <input id="reg-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update("email")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Phone (optional)</label>
              <input id="phone" placeholder="+1 (___) ___-____" value={form.phone} onChange={update("phone")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
            </div>
            <div>
              <label htmlFor="reg-password" className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Password</label>
              <input id="reg-password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update("password")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              {form.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex h-1 flex-1 gap-1">
                    {[0, 1, 2, 3].map((i) => (
                      <span key={i} className={`h-full flex-1 rounded-full ${i < strength ? "bg-accent" : "bg-line dark:bg-lineDark"}`} />
                    ))}
                  </div>
                  <span className="text-xs text-steel">{strengthLabel[strength]}</span>
                </div>
              )}
            </div>
            <div>
              <label htmlFor="confirm" className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Confirm password</label>
              <input id="confirm" type="password" autoComplete="new-password" placeholder="Re-enter your password" value={form.confirm} onChange={update("confirm")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
            </div>

            <label className="flex items-start gap-2 text-xs text-steel">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5" />
              <span>
                I agree to the <Link to="/privacy" className="text-ink underline underline-offset-2 dark:text-paper">Privacy Policy</Link> and{" "}
                <Link to="/cookies" className="text-ink underline underline-offset-2 dark:text-paper">Cookie Policy</Link>.
              </span>
            </label>

            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button type="submit" disabled={submitting} className="w-full bg-ink px-6 py-3.5 text-sm text-paper transition hover:bg-inkSoft disabled:opacity-60 dark:bg-paper dark:text-ink">
              {submitting ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-steel">
            Already have an account? <Link to="/login" className="text-ink underline underline-offset-2 dark:text-paper">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
