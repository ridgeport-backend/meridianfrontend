import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { getDashboardStats } from "../lib/adminApi.js";

function formatPrice(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    getDashboardStats(token).then((res) => {
      if (cancelled) return;
      if (res.ok) setStats(res.data);
      else setError(res.unreachable ? "Couldn't reach the server." : res.message || "Couldn't load stats.");
    });
    return () => { cancelled = true; };
  }, [token]);

  if (error) {
    return <div className="p-8 text-sm text-red-600 dark:text-red-400">{error}</div>;
  }
  if (!stats) {
    return <div className="p-8 text-sm text-steel">Loading…</div>;
  }

  const cards = [
    { label: "Vehicles in inventory", value: stats.vehicles.total, sub: `${stats.vehicles.available} available · ${stats.vehicles.sold} sold`, to: "/admin/vehicles" },
    { label: "Total orders", value: stats.orders.total, sub: `${stats.orders.byStatus.pending || 0} pending payment`, to: "/admin/orders" },
    { label: "Revenue (completed)", value: formatPrice(stats.revenue), sub: "Lifetime, completed orders only", to: "/admin/orders" },
    { label: "Customers", value: stats.customers, sub: "Registered accounts", to: "/admin/users" },
    { label: "Reviews awaiting approval", value: stats.pendingReviews, sub: "Not yet visible publicly", to: "/admin/reviews" },
    { label: "Open support tickets", value: stats.openTickets, sub: "Open or in progress", to: "/admin/support" },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-steel">A snapshot of the dealership right now.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="border border-line p-5 transition hover:border-ink dark:border-lineDark dark:hover:border-paper">
            <div className="font-display text-3xl">{c.value}</div>
            <div className="mt-1 text-sm">{c.label}</div>
            <div className="mt-0.5 text-xs text-steel">{c.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-lg">Recent Orders</h2>
          <div className="mt-3 divide-y divide-line border-y border-line text-sm dark:divide-lineDark dark:border-lineDark">
            {stats.recentOrders.length === 0 && <p className="py-4 text-steel">No orders yet.</p>}
            {stats.recentOrders.map((o) => (
              <div key={o._id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div>{o.vehicle?.year} {o.vehicle?.make} {o.vehicle?.model}</div>
                  <div className="text-xs text-steel">{o.customer?.name} · {formatDate(o.createdAt)}</div>
                </div>
                <span className="text-xs capitalize text-steel">{o.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg">Recent Support Activity</h2>
          <div className="mt-3 divide-y divide-line border-y border-line text-sm dark:divide-lineDark dark:border-lineDark">
            {stats.recentTickets.length === 0 && <p className="py-4 text-steel">No conversations yet.</p>}
            {stats.recentTickets.map((t) => (
              <div key={t._id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <div>{t.customer?.name}</div>
                  <div className="text-xs text-steel">{t.subject} · {formatDate(t.updatedAt)}</div>
                </div>
                <span className="text-xs capitalize text-steel">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}