// Talks to the real backend's /api/cart endpoints (all of which require the
// signed-in user's JWT). Falls back gracefully — same pattern as authClient
// and vehiclesApi — when the API is unreachable, so CartContext can decide
// whether to use the live cart or an in-memory local one.

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
    return { ok: false, unreachable: true }; // HTML error page, backend down, etc.
  }

  const data = await res.json();
  if (!res.ok) {
    // API is reachable and responded, just rejected the request (e.g. 409
    // "another customer just reserved this vehicle", or 401 invalid token —
    // both real, meaningful responses the UI should show, not silently mask)
    return { ok: false, unreachable: false, status: res.status, message: data.message };
  }
  return { ok: true, data };
}

export function getCart(token) {
  return authedRequest("/cart", { method: "GET" }, token);
}

export function addToCart(token, vehicleId) {
  return authedRequest("/cart/items", { method: "POST", body: JSON.stringify({ vehicleId }) }, token);
}

export function removeFromCart(token, vehicleId) {
  return authedRequest(`/cart/items/${vehicleId}`, { method: "DELETE" }, token);
}