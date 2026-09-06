import React from "react";
import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const links = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/vehicles", label: "Vehicles" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/reviews", label: "Reviews" },
  { to: "/admin/support", label: "Support" },
  { to: "/admin/users", label: "Users" },
];

export default function AdminLayout() {
  const { isAuthenticated, user, logout } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "superadmin");

  if (!isAdmin) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 px-6 text-center">
        <h1 className="font-display text-2xl">Admin access required</h1>
        <p className="max-w-sm text-sm text-steel">
          Sign in with an admin or superadmin account to reach the dashboard, inventory, orders, reviews,
          support, and user management tools.
        </p>
        <Link to="/login" state={{ from: "/admin" }} className="mt-2 bg-ink px-6 py-3 text-sm text-paper dark:bg-paper dark:text-ink">
          Sign In
        </Link>
        <Link to="/" className="text-sm text-steel underline underline-offset-2 hover:text-ink dark:hover:text-paper">
          Back to storefront
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] flex-col lg:flex-row">
      <aside className="border-b border-line dark:border-lineDark lg:w-56 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="p-5">
          <Link to="/" className="font-display text-lg">Meridian</Link>
          <p className="mt-0.5 text-xs uppercase tracking-wide text-steel">Admin Panel</p>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-0">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-4 py-2.5 text-sm lg:mx-2 ${
                  isActive
                    ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                    : "text-steel hover:bg-paperDim dark:hover:bg-inkSoft"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="hidden border-t border-line p-5 dark:border-lineDark lg:block">
          <p className="text-xs text-steel">Signed in as</p>
          <p className="text-sm">{user.name}</p>
          <button onClick={logout} className="mt-2 text-xs text-steel underline underline-offset-2 hover:text-ink dark:hover:text-paper">
            Sign out
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}