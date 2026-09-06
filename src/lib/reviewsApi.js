// Talks to the real backend's /api/reviews endpoints. Same graceful-fallback
// shape as the other API clients — { ok, data } or { ok: false, unreachable }.

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function request(path, options = {}, token) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    });
  } catch {
    return { ok: false, unreachable: true };
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return { ok: false, unreachable: true };
  const data = await res.json();
  if (!res.ok) return { ok: false, unreachable: false, message: data.message };
  return { ok: true, data };
}

export function fetchVehicleReviews(vehicleId) {
  return request(`/reviews/vehicle/${vehicleId}`, { method: "GET" });
}

export function fetchRecentReviews(limit = 6) {
  return request(`/reviews/recent?limit=${limit}`, { method: "GET" });
}

export function submitReview(token, { vehicleId, rating, title, body }) {
  return request("/reviews", { method: "POST", body: JSON.stringify({ vehicleId, rating, title, body }) }, token);
}

// admin
export function listAllReviews(token) {
  return request("/reviews", { method: "GET" }, token);
}
export function updateReviewStatus(token, reviewId, status) {
  return request(`/reviews/${reviewId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
}