import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { listAllReviews, updateReviewStatus } from "../lib/reviewsApi.js";

function formatDate(iso) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const statusStyles = {
  pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  approved: "bg-green-500/15 text-green-600 dark:text-green-400",
  rejected: "bg-red-500/15 text-red-600 dark:text-red-400",
  hidden: "bg-steel/15 text-steel",
};

export default function AdminReviews() {
  const { isAuthenticated, user, token } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "superadmin");

  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");

  useEffect(() => {
    let cancelled = false;
    if (!isAdmin || !token) return;
    listAllReviews(token).then((res) => {
      if (cancelled) return;
      if (res.ok) setReviews(res.data.reviews);
      else if (!res.unreachable) setError(res.message || "Couldn't load reviews.");
    });
    return () => { cancelled = true; };
  }, [isAdmin, token]);

  async function handleStatus(review, status) {
    const res = await updateReviewStatus(token, review._id, status);
    if (res.ok) {
      setReviews((prev) => prev.map((r) => (r._id === review._id ? res.data.review : r)));
    } else {
      setError(res.message || "Couldn't update this review.");
    }
  }

  if (!isAdmin) {
    return (
      <div className="container-edit py-10">
        <h1 className="font-display text-3xl">Review Moderation</h1>
        <p className="mt-2 text-sm text-steel">Sign in with an admin account to moderate reviews.</p>
      </div>
    );
  }

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.status === filter);

  return (
    <div className="container-edit py-10">
      <h1 className="font-display text-3xl">Review Moderation</h1>
      <p className="mt-1 text-sm text-steel">New reviews start pending — approve to show them publicly.</p>
      {error && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-6 flex flex-wrap gap-2">
        {["pending", "approved", "rejected", "hidden", "all"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`border px-4 py-1.5 text-sm capitalize ${filter === f ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink" : "border-line text-steel dark:border-lineDark"}`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-steel">No reviews here.</p>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
          {filtered.map((r) => (
            <div key={r._id} className="py-5 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-base">
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)} — {r.title}
                  </div>
                  <div className="mt-0.5 text-steel">
                    {r.customer?.name} ({r.customer?.email}) · {r.vehicle?.year} {r.vehicle?.make} {r.vehicle?.model} · {formatDate(r.createdAt)}
                    {r.verifiedPurchase && <span className="ml-2 text-ink dark:text-paper">Verified purchase</span>}
                  </div>
                </div>
                <span className={`rounded px-2 py-1 text-xs capitalize ${statusStyles[r.status] || ""}`}>{r.status}</span>
              </div>
              <p className="mt-2 text-steel">{r.body}</p>
              {r.status !== "approved" && (
                <button onClick={() => handleStatus(r, "approved")} className="mt-3 mr-3 bg-ink px-4 py-1.5 text-xs text-paper dark:bg-paper dark:text-ink">
                  Approve
                </button>
              )}
              {r.status !== "rejected" && (
                <button onClick={() => handleStatus(r, "rejected")} className="mt-3 mr-3 border border-line px-4 py-1.5 text-xs text-steel dark:border-lineDark">
                  Reject
                </button>
              )}
              {r.status !== "hidden" && (
                <button onClick={() => handleStatus(r, "hidden")} className="mt-3 border border-line px-4 py-1.5 text-xs text-steel dark:border-lineDark">
                  Hide
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}