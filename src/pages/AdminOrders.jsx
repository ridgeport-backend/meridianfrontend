import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useOrders } from "../context/OrdersContext.jsx";
import { listAllOrders as apiListAllOrders, updateOrderStatus as apiUpdateOrderStatus } from "../lib/ordersApi.js";

function formatPrice(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
function formatDate(iso) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const statusStyles = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
};

export default function AdminOrders() {
  const { isAuthenticated, user, token } = useAuth();
  const local = useOrders();
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "superadmin");

  const [liveOrders, setLiveOrders] = useState(null); // null until we know whether the API worked
  const [liveChecked, setLiveChecked] = useState(false); // has the first live check finished?
  const [liveError, setLiveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!isAdmin || !token) {
      setLiveChecked(true); // nothing to check — not an admin, go straight to local demo
      return;
    }
    apiListAllOrders(token).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setLiveOrders(res.data.orders);
      } else if (!res.unreachable) {
        setLiveError(res.message || "Couldn't load orders.");
      }
      setLiveChecked(true);
    });
    return () => { cancelled = true; };
  }, [isAdmin, token]);

  const usingLive = isAdmin && liveOrders !== null;
  // While we're admin and still waiting on the first live check, don't show
  // the local demo store yet — that's what caused old test data to flash
  // on screen before the real (possibly empty, possibly different) backend
  // data replaced it a moment later.
  const orders = usingLive ? liveOrders : liveChecked ? local.orders : [];

  async function handleApprove(order) {
    if (usingLive) {
      const res = await apiUpdateOrderStatus(token, order._id, "completed", "Payment confirmed by admin");
      if (res.ok) setLiveOrders((prev) => prev.map((o) => (o._id === order._id ? res.data.order : o)));
      else setLiveError(res.message || "Couldn't approve this order.");
    } else {
      local.approveOrder(order.orderNumber);
    }
  }

  async function handleCancel(order) {
    if (usingLive) {
      const res = await apiUpdateOrderStatus(token, order._id, "cancelled", "Payment not received");
      if (res.ok) setLiveOrders((prev) => prev.map((o) => (o._id === order._id ? res.data.order : o)));
      else setLiveError(res.message || "Couldn't cancel this order.");
    } else {
      local.cancelOrder(order.orderNumber, "Payment not received");
    }
  }

  if (isAdmin && !liveChecked) {
    return <div className="p-8 text-sm text-steel">Loading…</div>;
  }

  return (
    <div className="container-edit py-10">
      <h1 className="font-display text-3xl">Orders — Payment Confirmation</h1>

      {!isAdmin ? (
        <p className="mt-1 max-w-2xl text-sm text-steel">
          Signed in as a regular customer (or not signed in) — showing the local demo order store instead of
          real orders. <span className="text-ink dark:text-paper">Sign in with an admin account</span> in this
          tab to approve real orders placed through checkout.
        </p>
      ) : liveError ? (
        <p className="mt-1 max-w-2xl text-sm text-red-600 dark:text-red-400">{liveError}</p>
      ) : (
        <p className="mt-1 max-w-2xl text-sm text-steel">
          Showing real orders from the backend. Approving marks the payment as confirmed and the customer sees
          it as "Successful purchase" in their account immediately.
        </p>
      )}

      {orders.length === 0 ? (
        <p className="mt-8 text-sm text-steel">No orders yet.</p>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
          {orders.map((o) => {
            const vehicleLabel = usingLive
              ? `${o.vehicle?.year} ${o.vehicle?.make} ${o.vehicle?.model}`
              : `${o.items?.[0]?.year} ${o.items?.[0]?.make} ${o.items?.[0]?.model}`;
            const customerLabel = usingLive ? `${o.customer?.name} (${o.customer?.email})` : `${o.customerName} · ${o.customerEmail}`;
            return (
              <div key={o._id || o.orderNumber} className="py-5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-base">{o.orderNumber} · {customerLabel}</div>
                    <div className="mt-0.5 text-steel">placed {formatDate(o.createdAt)}</div>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs capitalize ${statusStyles[o.status] || ""}`}>{o.status}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 text-steel sm:grid-cols-5">
                  <div><div className="text-xs uppercase tracking-wide">Vehicle</div><div className="mt-0.5 text-ink dark:text-paper">{vehicleLabel}</div></div>
                  <div><div className="text-xs uppercase tracking-wide">Total</div><div className="mt-0.5 text-ink dark:text-paper">{formatPrice(o.total, o.currency)}</div></div>
                  <div><div className="text-xs uppercase tracking-wide">Method</div><div className="mt-0.5 capitalize text-ink dark:text-paper">{o.paymentMethod?.replace("_", " ")}</div></div>
                  <div><div className="text-xs uppercase tracking-wide">Reference</div><div className="mt-0.5 text-ink dark:text-paper">{o.paymentReference}</div></div>
                </div>

                {o.status === "pending" && (
                  <div className="mt-4 flex gap-3">
                    <button onClick={() => handleApprove(o)} className="bg-ink px-5 py-2 text-xs text-paper dark:bg-paper dark:text-ink">
                      Approve payment
                    </button>
                    <button onClick={() => handleCancel(o)} className="border border-line px-5 py-2 text-xs text-steel dark:border-lineDark">
                      Cancel order
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}