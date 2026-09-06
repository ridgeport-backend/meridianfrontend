// Talks to the real backend's /api/vehicles endpoints, and falls back to the
// local mock inventory if the API is unreachable or returns something that
// isn't JSON (same pattern as authClient.js). This means the site keeps
// working — with placeholder data — even if the backend is briefly down,
// misconfigured, or (during local dev) simply not running.

const API_BASE = import.meta.env.VITE_API_URL || "/api";

async function getJson(path) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`);
  } catch {
    return null; // network error
  }
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return null; // HTML error page etc.
  if (!res.ok) return null;
  return res.json();
}

// params: { q, make, model, category, region, fuelType, transmission,
//           minPrice, maxPrice, minYear, maxYear, featured, sort, page, limit }
export async function fetchVehicles(params = {}) {
  const query = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""))
  ).toString();
  const data = await getJson(`/vehicles${query ? `?${query}` : ""}`);
  return data; // { items, total, page, pages } | null
}

export async function fetchVehicleById(id) {
  const data = await getJson(`/vehicles/${id}`);
  return data ? data.vehicle : null;
}

// --- admin CRUD (all require an admin token) ---

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

export function createVehicle(token, payload) {
  return authedRequest("/vehicles", { method: "POST", body: JSON.stringify(payload) }, token);
}
export function updateVehicle(token, id, payload) {
  return authedRequest(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(payload) }, token);
}
export function deleteVehicle(token, id) {
  return authedRequest(`/vehicles/${id}`, { method: "DELETE" }, token);
}