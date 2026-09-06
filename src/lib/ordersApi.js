// Talks to the real backend's /api/orders endpoints. Same graceful-fallback
// shape as cartApi/vehiclesApi/authClient: { ok: true, data } on success,
// { ok: false, unreachable: true } if the API can't be reached at all, or
// { ok: false, unreachable: false, message } for a real rejection from the
// server (e.g. an expired reservation, or a non-admin trying to list all
// orders) that should be shown to the user rather than silently swallowed.

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function authedRequest(path, options = {}, token) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {}),
      },
    });
  } catch {
    return { ok: false, unreachable: true };
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return { ok: false, unreachable: true };
  }

  const data = await res.json();
  if (!res.ok) {
    return { ok: false, unreachable: false, status: res.status, message: data.message };
  }
  return { ok: true, data };
}

// One backend order == one vehicle (see backend/models/Order.js). A cart
// with multiple vehicles places one order per vehicle.
export function createOrder(token, { vehicleId, deliveryAddress, shippingMethod, paymentReference, paymentMethod }) {
  return authedRequest(
    "/orders",
    { method: "POST", body: JSON.stringify({ vehicleId, deliveryAddress, shippingMethod, paymentReference, paymentMethod }) },
    token
  );
}

export function listMyOrders(token) {
  return authedRequest("/orders/mine", { method: "GET" }, token);
}

// Admin-only on the backend (requireRole admin/superadmin) — will return a
// real 403 rejection (not "unreachable") if called with a non-admin token.
export function listAllOrders(token) {
  return authedRequest("/orders", { method: "GET" }, token);
}

export function updateOrderStatus(token, orderId, status, note) {
  return authedRequest(`/orders/${orderId}/status`, { method: "PATCH", body: JSON.stringify({ status, note }) }, token);
}