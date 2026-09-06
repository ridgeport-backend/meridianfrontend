import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useSupport } from "../context/SupportContext.jsx";
import {
  listTickets as apiListTickets,
  sendAdminReply as apiSendAdminReply,
  updateTicketStatus as apiUpdateTicketStatus,
} from "../lib/supportApi.js";

const POLL_MS = 4000;

function formatTime(iso) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

const statusStyles = {
  open: "bg-accent/15 text-accent",
  "in progress": "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  "waiting for customer": "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  resolved: "bg-green-500/15 text-green-600 dark:text-green-400",
  closed: "bg-steel/15 text-steel",
};

function normalizeLiveTicket(raw) {
  return {
    id: raw._id,
    customerName: raw.customer?.name || "Customer",
    customerEmail: raw.customer?.email || "",
    subject: raw.subject,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    messages: (raw.messages || []).map((m) => ({ sender: m.senderRole, body: m.body, at: m.createdAt })),
  };
}

export default function AdminSupport() {
  const { isAuthenticated, user, token } = useAuth();
  const isAdmin = isAuthenticated && (user?.role === "admin" || user?.role === "superadmin");
  const local = useSupport();

  const [liveTickets, setLiveTickets] = useState(null); // null = not loaded / unreachable
  const [liveChecked, setLiveChecked] = useState(false); // has the first live check finished?
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    function poll() {
      apiListTickets(token).then((res) => {
        if (res.ok) setLiveTickets(res.data.tickets.map(normalizeLiveTicket));
        setLiveChecked(true);
      });
    }
    clearInterval(pollRef.current);
    if (isAdmin && token) {
      poll();
      pollRef.current = setInterval(poll, POLL_MS);
    } else {
      setLiveChecked(true); // not an admin — nothing to wait for, go straight to local demo
    }
    return () => clearInterval(pollRef.current);
  }, [isAdmin, token]);

  const usingLive = isAdmin && liveTickets !== null;
  // Same reasoning as AdminOrders: don't show the local demo store until the
  // first live check has actually completed, so old test data never flashes
  // on screen before real backend data replaces it.
  const tickets = usingLive ? liveTickets : liveChecked ? local.tickets : [];
  const selected = tickets.find((t) => t.id === selectedId) || tickets[0] || null;

  useEffect(() => {
    if (!selectedId && tickets[0]) setSelectedId(tickets[0].id);
  }, [tickets, selectedId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [selected?.messages?.length, selectedId]);

  async function handleReply(e) {
    e.preventDefault();
    if (!draft.trim() || !selected) return;
    if (usingLive) {
      const res = await apiSendAdminReply(token, selected.id, draft.trim());
      if (res.ok) {
        setLiveTickets((prev) => prev.map((t) => (t.id === selected.id ? normalizeLiveTicket(res.data.ticket) : t)));
      }
    } else {
      local.sendAdminReply(selected.id, draft.trim());
    }
    setDraft("");
  }

  async function handleStatusChange(status) {
    if (!selected) return;
    if (usingLive) {
      const res = await apiUpdateTicketStatus(token, selected.id, status);
      if (res.ok) {
        setLiveTickets((prev) => prev.map((t) => (t.id === selected.id ? normalizeLiveTicket(res.data.ticket) : t)));
      }
    } else {
      local.updateTicketStatus(selected.id, status);
    }
  }

  if (isAdmin && !liveChecked) {
    return <div className="p-8 text-sm text-steel">Loading…</div>;
  }

  return (
    <div className="container-edit py-10">
      <h1 className="font-display text-3xl">Support Center</h1>
      {!isAdmin ? (
        <p className="mt-1 max-w-2xl text-sm text-steel">
          Signed in as a regular customer (or not signed in) — showing the local demo ticket store.{" "}
          <span className="text-ink dark:text-paper">Sign in with an admin account</span> in this tab to see and
          reply to real conversations.
        </p>
      ) : (
        <p className="mt-1 max-w-2xl text-sm text-steel">
          Showing real conversations from the backend, refreshed every few seconds. Replies here reach the
          customer's chat widget the same way.
        </p>
      )}

      <div className="mt-8 grid gap-0 border border-line dark:border-lineDark lg:grid-cols-[320px_1fr]">
        {/* Ticket list */}
        <div className="max-h-[32rem] overflow-y-auto border-b border-line dark:border-lineDark lg:border-b-0 lg:border-r">
          {tickets.length === 0 && (
            <p className="p-6 text-center text-sm text-steel">No support conversations yet.</p>
          )}
          {tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`block w-full border-b border-line px-4 py-3 text-left text-sm last:border-b-0 dark:border-lineDark ${
                selected?.id === t.id ? "bg-paperDim dark:bg-ink" : "hover:bg-paperDim/60 dark:hover:bg-ink/60"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{t.customerName}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] uppercase tracking-wide ${statusStyles[t.status] || ""}`}>
                  {t.status}
                </span>
              </div>
              <p className="mt-1 truncate text-steel">{t.messages[t.messages.length - 1]?.body}</p>
              <p className="mt-1 text-[11px] text-steel/70">{formatTime(t.updatedAt)}</p>
            </button>
          ))}
        </div>

        {/* Conversation */}
        <div className="flex h-[32rem] flex-col">
          {!selected ? (
            <div className="flex flex-1 items-center justify-center text-sm text-steel">Select a conversation</div>
          ) : (
            <>
              <div className="flex items-center justify-between border-b border-line px-5 py-3 dark:border-lineDark">
                <div>
                  <p className="text-sm font-medium">{selected.customerName}</p>
                  <p className="text-xs text-steel">{selected.customerEmail} · {selected.subject}</p>
                </div>
                <select
                  value={selected.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="border border-line bg-transparent px-2 py-1.5 text-xs dark:border-lineDark"
                >
                  {["open", "in progress", "waiting for customer", "resolved", "closed"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-5">
                {selected.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "admin" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] px-3 py-2 text-sm ${
                        m.sender === "admin"
                          ? "bg-accent text-white"
                          : "bg-paperDim text-ink dark:bg-inkSoft dark:text-paper"
                      }`}
                    >
                      {m.body}
                      <div className={`mt-1 text-[10px] ${m.sender === "admin" ? "text-white/70" : "text-steel"}`}>
                        {formatTime(m.at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleReply} className="flex items-center gap-2 border-t border-line p-3 dark:border-lineDark">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Reply to customer…"
                  className="flex-1 border border-line bg-transparent px-3 py-2 text-sm dark:border-lineDark"
                />
                <button type="submit" className="bg-ink px-4 py-2 text-sm text-paper dark:bg-paper dark:text-ink">
                  Reply
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}