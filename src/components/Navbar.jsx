import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/inventory", label: "Inventory" },
  { to: "/about", label: "About" },
  { to: "/help", label: "Help Center" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { items } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function handleCartClick(e) {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate("/login", { state: { from: "/cart" } });
    }
  }

  return (
    <header className="sticky top-0 z-50">
      {/* utility bar */}
      <div className="hidden border-b border-line bg-ink text-paper dark:border-lineDark dark:bg-inkSoft md:block">
        <div className="container-edit flex h-9 items-center justify-between text-xs">
          <span className="text-paper/70">Worldwide shipping · Financing available on select vehicles</span>
          <div className="flex items-center gap-5 text-paper/70">
            <span>Mon–Sat, 9:00–18:00 GMT</span>
            <a href="tel:+18005550134" className="hover:text-paper">+1 (800) 555-0134</a>
            <span>USD $</span>
          </div>
        </div>
      </div>

      {/* main nav */}
      <div className="border-b border-line bg-paper/95 backdrop-blur dark:border-lineDark dark:bg-ink/95">
        <div className="container-edit flex h-20 items-center justify-between">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="font-display text-2xl tracking-tight">Meridian</span>
            <span className="text-[11px] tracking-[0.15em] text-steel">MOTORCARS</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `text-sm transition hover:text-accent ${isActive ? "text-accent" : "text-ink/80 dark:text-paper/80"}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="hidden h-9 w-9 items-center justify-center rounded-full border border-line text-ink transition hover:border-ink dark:border-lineDark dark:text-paper dark:hover:border-paper sm:flex"
            >
              {theme === "dark" ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.5" /><path d="M12 2v2.5M12 19.5V22M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2 12h2.5M19.5 12H22M4.2 19.8L6 18M18 6l1.8-1.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" stroke="currentColor" strokeWidth="1.5" /></svg>
              )}
            </button>

            <Link to="/cart" onClick={handleCartClick} className="relative text-sm text-ink/80 hover:text-accent dark:text-paper/80">
              Cart
              {items.length > 0 && (
                <span className="ml-1 rounded-full bg-accent px-1.5 py-0.5 text-xs text-white">{items.length}</span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link to="/account" className="rounded-full border border-ink px-5 py-2 text-sm transition hover:bg-ink hover:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-ink">
                  {user?.name?.split(" ")[0] || "My Account"}
                </Link>
                <button onClick={logout} className="text-sm text-steel hover:text-ink dark:hover:text-paper">Sign out</button>
              </div>
            ) : (
              <Link to="/login" className="hidden rounded-full border border-ink px-5 py-2 text-sm transition hover:bg-ink hover:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-ink md:inline-block">
                Sign In
              </Link>
            )}

            <button className="text-ink dark:text-paper md:hidden" aria-label="Open menu" onClick={() => setOpen((o) => !o)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" /></svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="border-b border-line bg-paper dark:border-lineDark dark:bg-ink md:hidden">
          <div className="container-edit flex flex-col gap-4 py-6">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)} className="text-base">
                {l.label}
              </NavLink>
            ))}
            {isAuthenticated ? (
              <>
                <Link to="/account" onClick={() => setOpen(false)} className="text-base font-medium">My Account</Link>
                <button onClick={() => { logout(); setOpen(false); }} className="text-left text-base text-steel">Sign out</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="text-base font-medium">Sign In</Link>
            )}
            <button onClick={toggleTheme} className="flex items-center gap-2 text-base text-steel">
              {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}