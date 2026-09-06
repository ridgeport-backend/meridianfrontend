import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useSupport } from "../context/SupportContext.jsx";

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function SupportWidget() {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { isAuthenticated } = useAuth();
  const { ticket, sendMessage } = useSupport();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [open, ticket?.messages?.length]);

  function handleSend(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    sendMessage(draft.trim());
    setDraft("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[28rem] w-80 flex-col border border-line bg-paper shadow-xl dark:border-lineDark dark:bg-inkSoft sm:w-96">
          <div className="flex items-center justify-between border-b border-line px-4 py-3 dark:border-lineDark">
            <div>
              <p className="text-sm font-medium">Meridian Support</p>
              <p className="text-xs text-steel">Typically replies within a few minutes</p>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" className="text-steel hover:text-ink dark:hover:text-paper">
              ✕
            </button>
          </div>

          {!isAuthenticated ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
              <p className="text-sm text-steel">Sign in to chat with our support team about an order or vehicle.</p>
              <Link
                to="/login"
                state={{ from: window.location.pathname }}
                onClick={() => setOpen(false)}
                className="bg-ink px-5 py-2.5 text-sm text-paper dark:bg-paper dark:text-ink"
              >
                Sign In
              </Link>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
                {!ticket && (
                  <p className="text-center text-xs text-steel">
                    Send a message below to start a conversation with our team.
                  </p>
                )}
                {ticket?.messages.map((m, i) => (
                  <div key={i} className={`flex ${m.sender === "customer" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] px-3 py-2 text-sm ${
                        m.sender === "customer"
                          ? "bg-ink text-paper dark:bg-paper dark:text-ink"
                          : "bg-paperDim text-ink dark:bg-ink dark:text-paper"
                      }`}
                    >
                      {m.body}
                      <div className={`mt-1 text-[10px] ${m.sender === "customer" ? "text-paper/60 dark:text-ink/50" : "text-steel"}`}>
                        {formatTime(m.at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <form onSubmit={handleSend} className="flex items-center gap-2 border-t border-line p-3 dark:border-lineDark">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type a message…"
                  className="flex-1 border border-line bg-transparent px-3 py-2 text-sm dark:border-lineDark"
                />
                <button type="submit" className="bg-ink px-4 py-2 text-sm text-paper dark:bg-paper dark:text-ink">
                  Send
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg transition hover:bg-accent-deep"
        aria-label="Open support chat"
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 12a8.5 8.5 0 0 1-12.4 7.55L4 21l1.45-4.6A8.5 8.5 0 1 1 21 12Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></svg>
        )}
      </button>
    </div>
  );
}