// Talks to the real backend's /api/users/me/favorites endpoints. Same
// graceful-fallback shape as the other API clients in this app.

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function authedRequest(path, options = {}, token) {
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

export function getFavorites(token) {
  return authedRequest("/users/me/favorites", { method: "GET" }, token);
}
export function addFavorite(token, vehicleId) {
  return authedRequest(`/users/me/favorites/${vehicleId}`, { method: "POST" }, token);
}
export function removeFavorite(token, vehicleId) {
  return authedRequest(`/users/me/favorites/${vehicleId}`, { method: "DELETE" }, token);
}