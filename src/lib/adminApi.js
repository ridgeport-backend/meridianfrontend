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

export function getDashboardStats(token) {
  return authedRequest("/admin/stats", { method: "GET" }, token);
}
export function listUsers(token) {
  return authedRequest("/admin/users", { method: "GET" }, token);
}
export function updateUserRole(token, userId, role) {
  return authedRequest(`/admin/users/${userId}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, token);
}
export function updateUserStatus(token, userId, isActive) {
  return authedRequest(`/admin/users/${userId}/status`, { method: "PATCH", body: JSON.stringify({ isActive }) }, token);
}