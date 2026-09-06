import React, { useState } from "react";
import MapPreview3D from "../components/MapPreview3D.jsx";

const offices = [
  { city: "Manchester, UK", address: "14 Deansgate, Manchester M3 2GD", hours: "Mon–Sat, 9:00–18:00 GMT" },
  { city: "Lagos, Nigeria", address: "Plot 22 Adeola Odeku St, Victoria Island", hours: "Mon–Sat, 9:00–17:00 WAT" },
  { city: "Amsterdam, NL", address: "Herengracht 182, 1016 BR Amsterdam", hours: "Mon–Fri, 9:00–17:00 CET" },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      setError("Fill in your name, email, and message.");
      return;
    }
    setError("");
    // In production this posts to /api/contact and the message appears in the admin panel.
    setSent(true);
  }

  return (
    <div className="container-edit py-16 md:py-24">
      <h1 className="font-display text-4xl">Contact Us</h1>
      <p className="mt-3 max-w-md text-steel">
        Questions about a vehicle, an order, or shipping to your country — our team typically responds
        within one business day.
      </p>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <div>
          {sent ? (
            <div className="border border-line p-6 text-sm dark:border-lineDark">
              <p className="font-display text-lg">Message sent</p>
              <p className="mt-2 text-steel">
                Thanks, {form.name.split(" ")[0]} — we've received your message and will reply to {form.email} shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <input placeholder="Full name" value={form.name} onChange={update("name")} className="border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                <input type="email" placeholder="Email" value={form.email} onChange={update("email")} className="border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              </div>
              <input placeholder="Subject" value={form.subject} onChange={update("subject")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              <textarea rows={5} placeholder="How can we help?" value={form.message} onChange={update("message")} className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
              <button type="submit" className="bg-ink px-7 py-3.5 text-sm text-paper transition hover:bg-inkSoft dark:bg-paper dark:text-ink">
                Send Message
              </button>
            </form>
          )}

          <div className="mt-10 space-y-6 border-t border-line pt-8 dark:border-lineDark">
            {offices.map((o) => (
              <div key={o.city} className="text-sm">
                <div className="font-medium">{o.city}</div>
                <div className="mt-0.5 text-steel">{o.address}</div>
                <div className="text-steel">{o.hours}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <MapPreview3D />
          <p className="mt-3 text-xs text-steel">
            Showroom location shown as a stylized preview. A live interactive map can be wired in with a
            mapping provider API key from the admin panel.
          </p>

          <div className="mt-10 border border-line p-6 dark:border-lineDark">
            <h2 className="text-lg">Opening Hours</h2>
            <p className="mt-1 text-xs text-steel">Manchester headquarters</p>
            <dl className="mt-4 divide-y divide-line text-sm dark:divide-lineDark">
              {[
                ["Monday – Friday", "9:00 AM – 6:00 PM"],
                ["Saturday", "10:00 AM – 4:00 PM"],
                ["Sunday", "Closed"],
              ].map(([day, hours]) => (
                <div key={day} className="flex justify-between py-2">
                  <dt className="text-steel">{day}</dt>
                  <dd>{hours}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-xs text-steel">
              Hours vary by regional office — see Lagos and Amsterdam listings for local times.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}