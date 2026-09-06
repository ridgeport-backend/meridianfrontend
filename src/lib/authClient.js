// Talks to the real backend when it's available, and falls back to a
// local-only mock account store when it isn't — e.g. this frontend deployed
// to Netlify on its own with no backend deployed yet. This means Login and
// Register work immediately in a static demo deployment. Once a real
// backend is deployed (see backend/README or your Render setup), point
// API_BASE at it and the fallback simply stops triggering — no other code
// changes needed.

const API_BASE = import.meta.env.VITE_API_URL || "/api";
const MOCK_USERS_KEY = "dealership_mock_users";

function loadMockUsers() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

function mockToken(email) {
  return "mock." + btoa(email) + "." + Date.now();
}

// Tries the real API first. If the request fails outright (network error —
// no backend deployed) or the response isn't JSON (a host's 404/error page,
// like Netlify's default 404 HTML), we fall back to the mock store instead
// of surfacing a confusing parse error to the user.
async function callApi(path, payload) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch {
    return null; // network error — no backend reachable, use fallback
  }

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return null; // got an HTML error page instead of JSON — use fallback
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export async function registerUser({ name, email, phone, password }) {
  const apiResult = await callApi("/auth/register", { name, email, phone, password });
  if (apiResult) return apiResult;

  // --- local fallback ---
  const users = loadMockUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists.");
  }
  const user = { name, email, phone, role: "customer" };
  users.push({ ...user, password }); // demo only — never store plaintext passwords in production
  saveMockUsers(users);
  return { user, token: mockToken(email) };
}

export async function loginUser({ email, password }) {
  const apiResult = await callApi("/auth/login", { email, password });
  if (apiResult) return apiResult;

  // --- local fallback ---
  const users = loadMockUsers();
  const match = users.find((u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!match) throw new Error("We couldn't sign you in with those details.");
  const { password: _pw, ...user } = match;
  return { user, token: mockToken(email) };
}
