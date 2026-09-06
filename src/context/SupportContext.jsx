import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { getMyTicket as apiGetMyTicket, sendCustomerMessage as apiSendCustomerMessage } from "../lib/supportApi.js";

const SupportContext = createContext(null);
const STORAGE_KEY = "dealership_support_tickets";
const POLL_MS = 4000;

function loadTickets() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}
function saveTickets(tickets) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

// Normalizes a backend ticket (messages use `senderRole` + `createdAt`) into
// the same shape the local/demo store already used (`sender` + `at`), so
// every consumer (SupportWidget, AdminSupport) can render either source
// identically.
function normalizeLiveTicket(raw) {
  if (!raw) return null;
  return {
    id: raw._id,
    customerName: raw.customer?.name,
    customerEmail: raw.customer?.email,
    subject: raw.subject,
    priority: raw.priority,
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    messages: (raw.messages || []).map((m) => ({ sender: m.senderRole, body: m.body, at: m.createdAt })),
  };
}

// This provider does two jobs:
//  1. A pure local/demo ticket store (localStorage + cross-tab `storage`
//     events) — the original implementation, kept as a fallback and as
//     what the admin inbox uses when not signed in as a real admin.
//  2. A live overlay for the customer-facing widget: polls GET
//     /api/support/mine every few seconds while signed in, and posts new
//     messages to the real API first, falling back to the local store only
//     if the API is unreachable.
export function SupportProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();

  // --- local/demo store ---
  const [tickets, setTickets] = useState(loadTickets);

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setTickets(loadTickets());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next) => {
    setTickets(next);
    saveTickets(next);
  }, []);

  const getMyLocalTicket = useCallback(() => {
    if (!user) return null;
    return tickets.find((t) => t.customerEmail === user.email) || null;
  }, [tickets, user]);

  const sendLocalCustomerMessage = useCallback(
    (body, subject = "General inquiry") => {
      if (!user) return;
      const now = new Date().toISOString();
      const existing = tickets.find((t) => t.customerEmail === user.email);
      if (existing) {
        const next = tickets.map((t) =>
          t.id === existing.id
            ? {
                ...t,
                status: t.status === "closed" ? "open" : t.status,
                updatedAt: now,
                messages: [...t.messages, { sender: "customer", body, at: now }],
              }
            : t
        );
        persist(next);
      } else {
        const ticket = {
          id: "T-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
          customerName: user.name,
          customerEmail: user.email,
          subject,
          priority: "normal",
          status: "open",
          createdAt: now,
          updatedAt: now,
          messages: [{ sender: "customer", body, at: now }],
        };
        persist([ticket, ...tickets]);
      }
    },
    [tickets, user, persist]
  );

  const sendAdminReply = useCallback(
    (ticketId, body) => {
      const now = new Date().toISOString();
      const next = tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: "in progress", updatedAt: now, messages: [...t.messages, { sender: "admin", body, at: now }] }
          : t
      );
      persist(next);
    },
    [tickets, persist]
  );

  const updateTicketStatus = useCallback(
    (ticketId, status) => {
      const next = tickets.map((t) => (t.id === ticketId ? { ...t, status, updatedAt: new Date().toISOString() } : t));
      persist(next);
    },
    [tickets, persist]
  );

  // --- live overlay (customer widget) ---
  const [liveTicket, setLiveTicket] = useState(null);
  const [usingLive, setUsingLive] = useState(false);
  const pollRef = useRef(null);

  useEffect(() => {
    function poll() {
      apiGetMyTicket(token).then((res) => {
        if (res.ok) {
          setLiveTicket(normalizeLiveTicket(res.data.ticket));
          setUsingLive(true);
        } else {
          setUsingLive(false);
        }
      });
    }

    clearInterval(pollRef.current);
    if (isAuthenticated && token) {
      poll();
      pollRef.current = setInterval(poll, POLL_MS);
    } else {
      setLiveTicket(null);
      setUsingLive(false);
    }
    return () => clearInterval(pollRef.current);
  }, [isAuthenticated, token]);

  const sendMessage = useCallback(
    async (body) => {
      if (isAuthenticated && token) {
        const res = await apiSendCustomerMessage(token, body);
        if (res.ok) {
          setLiveTicket(normalizeLiveTicket(res.data.ticket));
          setUsingLive(true);
          return;
        }
        // unreachable — fall through to local
      }
      sendLocalCustomerMessage(body);
    },
    [isAuthenticated, token, sendLocalCustomerMessage]
  );

  const ticket = usingLive ? liveTicket : getMyLocalTicket();

  return (
    <SupportContext.Provider
      value={{
        // widget-facing (customer)
        ticket,
        sendMessage,
        usingLive,
        // admin-facing local fallback (used by AdminSupport when not
        // signed in as a real admin, or if the live API is unreachable)
        tickets,
        sendAdminReply,
        updateTicketStatus,
      }}
    >
      {children}
    </SupportContext.Provider>
  );
}

export function useSupport() {
  return useContext(SupportContext);
}