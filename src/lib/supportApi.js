// Talks to the real backend's /api/support endpoints. Since there's no
// WebSocket infrastructure set up yet, "real time" here means short-interval
// polling (see SupportContext.jsx and AdminSupport.jsx) — the UI behavior is
// identical to true push, just with a few seconds of latency. Swapping in
// Socket.IO later wouldn't require changing anything about this API shape.

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

// customer
export function getMyTicket(token) {
  return request("/support/mine", { method: "GET" }, token);
}
export function sendCustomerMessage(token, body, subject) {
  return request("/support/messages", { method: "POST", body: JSON.stringify({ body, subject }) }, token);
}

// admin
export function listTickets(token) {
  return request("/support", { method: "GET" }, token);
}
export function sendAdminReply(token, ticketId, body) {
  return request(`/support/${ticketId}/messages`, { method: "POST", body: JSON.stringify({ body }) }, token);
}
export function updateTicketStatus(token, ticketId, status) {
  return request(`/support/${ticketId}/status`, { method: "PATCH", body: JSON.stringify({ status }) }, token);
}