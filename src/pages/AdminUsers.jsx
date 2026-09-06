import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listUsers, updateUserRole, updateUserStatus } from "../lib/adminApi.js";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminUsers() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    listUsers(token).then((res) => {
      if (res.ok) setUsers(res.data.users);
      else setError(res.unreachable ? "Couldn't reach the server." : res.message || "Couldn't load users.");
      setLoading(false);
    });
  }, [token]);

  async function handleRoleChange(u, role) {
    const res = await updateUserRole(token, u._id, role);
    if (res.ok) setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.user : x)));
    else setError(res.message || "Couldn't update this user's role.");
  }

  async function handleToggleActive(u) {
    const res = await updateUserStatus(token, u._id, !u.isActive);
    if (res.ok) setUsers((prev) => prev.map((x) => (x._id === u._id ? res.data.user : x)));
    else setError(res.message || "Couldn't update this user's status.");
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-3xl">Users</h1>
      <p className="mt-1 text-sm text-steel">Registered customer accounts. Freezing blocks sign-in immediately.</p>
      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <p className="mt-8 text-sm text-steel">Loading…</p>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
          {users.map((u) => (
            <div key={u._id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
              <div>
                <div>{u.name}</div>
                <div className="text-xs text-steel">{u.email} · joined {formatDate(u.createdAt)}</div>
              </div>
              <div className="flex items-center gap-4">
                {!u.isActive && (
                  <span className="rounded bg-red-500/15 px-2 py-1 text-xs text-red-600 dark:text-red-400">Frozen</span>
                )}
                <select
                  value={u.role}
                  onChange={(e) => handleRoleChange(u, e.target.value)}
                  className="border border-line bg-transparent px-2 py-1.5 text-xs dark:border-lineDark"
                >
                  {["customer", "admin", "superadmin"].map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
                <button
                  onClick={() => handleToggleActive(u)}
                  className={`px-3 py-1.5 text-xs ${u.isActive ? "border border-line text-steel dark:border-lineDark" : "bg-ink text-paper dark:bg-paper dark:text-ink"}`}
                >
                  {u.isActive ? "Freeze" : "Unfreeze"}
                </button>
              </div>
            </div>
          ))}
          {users.length === 0 && <p className="py-4 text-sm text-steel">No customer accounts yet.</p>}
        </div>
      )}
    </div>
  );
}