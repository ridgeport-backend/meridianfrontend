
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";
import { useOrders } from "../context/OrdersContext.jsx";
import { listMyOrders as apiListMyOrders } from "../lib/ordersApi.js";
import VehicleCard from "../components/VehicleCard.jsx";

function formatPrice(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

const statusStyles = {
  pending: "bg-steel/15 text-steel",
  "awaiting payment": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  paid: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  processing: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "vehicle reserved": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "preparing for delivery": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  shipped: "bg-accent/15 text-accent",
  delivered: "bg-green-500/15 text-green-600 dark:text-green-400",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
  refunded: "bg-red-500/15 text-red-600 dark:text-red-400",
};

const tabs = ["Overview", "My Orders", "Saved Vehicles", "Profile", "Security"];

export default function Account() {
  const { user, logout, isAuthenticated, token } = useAuth();
  const { favorites: savedVehicles } = useFavorites();
  const { myOrders } = useOrders();
  const [tab, setTab] = useState("Overview");
  const [liveApiOrders, setLiveApiOrders] = useState(null); // null = not loaded yet / unreachable
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    apiListMyOrders(token).then((res) => {
      if (cancelled) return;
      if (res.ok) setLiveApiOrders(res.data.orders);
    });
    return () => { cancelled = true; };
  }, [token]);

  if (!isAuthenticated) {
    navigate("/login", { state: { from: "/account" }, replace: true });
    return null;
  }



  // Two possible sources of order data, normalized into one shape:
  // 1. Real orders from the backend (liveApiOrders) — one order per vehicle
  // 2. Locally-placed pending orders (OrdersContext.myOrders) — used when
  //    checkout couldn't reach the real API
  // (Seeded demo history has been removed — it was showing on every account,
  // new or old, which is misleading now that real orders work.)
  const liveOrders = (liveApiOrders || []).map((o) => ({
    orderNumber: o.orderNumber,
    vehicleLabel: `${o.vehicle.year} ${o.vehicle.make} ${o.vehicle.model}`,
    date: o.createdAt,
    amount: o.total,
    currency: o.currency,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentReference: o.paymentReference,
    trackingNumber: o.shipping?.trackingNumber,
    estimatedDelivery: o.shipping?.estimatedDelivery,
  }));
  const localFallbackOrders = liveApiOrders
    ? [] // real API worked, don't also show stale local-only pending orders
    : myOrders.map((o) => ({
        orderNumber: o.orderNumber,
        vehicleLabel: o.items?.map((i) => `${i.year} ${i.make} ${i.model}`).join(", ") || "Vehicle",
        date: o.createdAt,
        amount: o.total,
        currency: o.currency,
        status: o.status === "completed" ? "completed" : o.status === "cancelled" ? "cancelled" : "pending",
        paymentMethod: o.paymentMethod,
        paymentReference: o.paymentReference,
        trackingNumber: null,
        estimatedDelivery: null,
      }));
  const allOrders = [...liveOrders, ...localFallbackOrders].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="container-edit py-10">
      <h1 className="font-display text-3xl">My Account</h1>
      <p className="mt-1 text-sm text-steel">Welcome back, {user?.name?.split(" ")[0] || "there"}.</p>

      <div className="mt-8 grid gap-10 lg:grid-cols-[220px_1fr]">
        {/* Sidebar */}
        <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`whitespace-nowrap px-4 py-2.5 text-left text-sm lg:w-full ${
                tab === t
                  ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                  : "text-steel hover:bg-paperDim dark:hover:bg-inkSoft"
              }`}
            >
              {t}
            </button>
          ))}
          <button
            onClick={handleLogout}
            className="whitespace-nowrap px-4 py-2.5 text-left text-sm text-steel hover:bg-paperDim dark:hover:bg-inkSoft lg:w-full"
          >
            Sign out
          </button>
        </nav>

        {/* Content */}
        <div>
          {tab === "Overview" && (
            <div className="space-y-8">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="border border-line p-5 dark:border-lineDark">
                  <div className="font-display text-2xl">{allOrders.length}</div>
                  <div className="mt-1 text-sm text-steel">Orders</div>
                </div>
                <div className="border border-line p-5 dark:border-lineDark">
                  <div className="font-display text-2xl">{savedVehicles.length}</div>
                  <div className="mt-1 text-sm text-steel">Saved vehicles</div>
                </div>
                <div className="border border-line p-5 dark:border-lineDark">
                  <div className="font-display text-2xl">
                    {allOrders.filter((o) => o.status === "pending").length}
                  </div>
                  <div className="mt-1 text-sm text-steel">Pending payment</div>
                </div>
              </div>

              <div>
                <h2 className="text-lg">Recent Orders</h2>
                <div className="mt-4 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
                  {allOrders.slice(0, 3).map((o) => (
                    <div key={o.orderNumber} className="flex items-center justify-between gap-4 py-4 text-sm">
                      <div>
                        <div>{o.vehicleLabel}</div>
                        <div className="mt-0.5 text-steel">{o.orderNumber} · {formatDate(o.date)}</div>
                      </div>
                      <span className={`rounded px-2 py-1 text-xs capitalize ${statusStyles[o.status] || ""}`}>
                        {o.status === "completed" ? "Successful purchase" : o.status}
                      </span>
                    </div>
                  ))}
                  {allOrders.length === 0 && <p className="py-4 text-sm text-steel">No orders yet.</p>}
                </div>
              </div>

              {savedVehicles.length > 0 && (
                <div>
                  <h2 className="text-lg">Saved Vehicles</h2>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    {savedVehicles.slice(0, 2).map((v) => <VehicleCard key={v._id} vehicle={v} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "My Orders" && (
            <div>
              <h2 className="text-lg">My Orders</h2>
              {allOrders.length === 0 ? (
                <p className="mt-4 text-sm text-steel">You haven't placed any orders yet.</p>
              ) : (
                <div className="mt-4 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
                  {allOrders.map((o) => (
                    <div key={o.orderNumber} className="py-5 text-sm">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-base">{o.vehicleLabel}</div>
                          <div className="mt-0.5 text-steel">{o.orderNumber} · Placed {formatDate(o.date)}</div>
                        </div>
                        <span className={`rounded px-2 py-1 text-xs capitalize ${statusStyles[o.status] || ""}`}>
                          {o.status === "completed" ? "Successful purchase" : o.status === "pending" ? "Pending payment" : o.status}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-steel sm:grid-cols-4">
                        <div><div className="text-xs uppercase tracking-wide">Amount</div><div className="mt-0.5 text-ink dark:text-paper">{formatPrice(o.amount, o.currency)}</div></div>
                        {o.paymentMethod ? (
                          <div><div className="text-xs uppercase tracking-wide">Payment method</div><div className="mt-0.5 capitalize text-ink dark:text-paper">{o.paymentMethod.replace("_", " ")}</div></div>
                        ) : (
                          <div><div className="text-xs uppercase tracking-wide">Payment</div><div className="mt-0.5 capitalize text-ink dark:text-paper">paid</div></div>
                        )}
                        {o.paymentReference ? (
                          <div><div className="text-xs uppercase tracking-wide">Reference</div><div className="mt-0.5 text-ink dark:text-paper">{o.paymentReference}</div></div>
                        ) : (
                          <div><div className="text-xs uppercase tracking-wide">Tracking</div><div className="mt-0.5 text-ink dark:text-paper">{o.trackingNumber}</div></div>
                        )}
                        {o.estimatedDelivery && (
                          <div><div className="text-xs uppercase tracking-wide">Est. delivery</div><div className="mt-0.5 text-ink dark:text-paper">{formatDate(o.estimatedDelivery)}</div></div>
                        )}
                      </div>
                      {o.status === "pending" && (
                        <p className="mt-3 text-xs text-steel">
                          Awaiting confirmation of your {o.paymentMethod?.replace("_", " ")} payment
                          {o.paymentReference && <> — reference <span className="text-ink dark:text-paper">{o.paymentReference}</span></>}.
                          This updates automatically once confirmed.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "Saved Vehicles" && (
            <div>
              <h2 className="text-lg">Saved Vehicles</h2>
              {savedVehicles.length === 0 ? (
                <p className="mt-4 text-sm text-steel">
                  No saved vehicles yet. Tap "Save Vehicle" on any listing to add it here — {" "}
                  <Link to="/inventory" className="underline underline-offset-2">browse inventory</Link>.
                </p>
              ) : (
                <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {savedVehicles.map((v) => <VehicleCard key={v._id} vehicle={v} />)}
                </div>
              )}
            </div>
          )}

          {tab === "Profile" && (
            <div>
              <h2 className="text-lg">Profile</h2>
              <form className="mt-4 max-w-md space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Full name</label>
                  <input defaultValue={user?.name} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Email</label>
                  <input defaultValue={user?.email} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Phone</label>
                  <input defaultValue={user?.phone} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wide text-steel">City</label>
                    <input className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Country</label>
                    <input className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                  </div>
                </div>
                <button className="bg-ink px-6 py-3 text-sm text-paper dark:bg-paper dark:text-ink">Save Changes</button>
              </form>
            </div>
          )}

          {tab === "Security" && (
            <div className="max-w-md space-y-8">
              <div>
                <h2 className="text-lg">Change Password</h2>
                <form className="mt-4 space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input type="password" placeholder="Current password" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                  <input type="password" placeholder="New password" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                  <button className="bg-ink px-6 py-3 text-sm text-paper dark:bg-paper dark:text-ink">Update Password</button>
                </form>
              </div>
              <div className="border-t border-line pt-6 dark:border-lineDark">
                <h2 className="text-lg">Two-Factor Authentication</h2>
                <p className="mt-1 text-sm text-steel">Add an extra layer of security to your account.</p>
                <button className="mt-3 border border-ink px-6 py-3 text-sm dark:border-paper">Enable 2FA</button>
              </div>
              <div className="border-t border-line pt-6 dark:border-lineDark">
                <h2 className="text-lg">Active Sessions</h2>
                <p className="mt-1 text-sm text-steel">This device is currently signed in.</p>
                <button onClick={handleLogout} className="mt-3 text-sm text-red-600 underline underline-offset-2 dark:text-red-400">
                  Sign out of all sessions
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}