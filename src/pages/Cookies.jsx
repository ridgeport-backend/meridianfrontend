import React from "react";

const categories = [
  { name: "Necessary", desc: "Required for the site to function — keeping you signed in and your cart intact. Always on.", required: true },
  { name: "Analytics", desc: "Helps us understand which vehicles and pages get the most interest, so we can improve the site." },
  { name: "Marketing", desc: "Used to show you relevant vehicle recommendations across other sites you visit." },
  { name: "Preferences", desc: "Remembers choices like currency, light or dark mode, and saved filters." },
];

export default function Cookies() {
  return (
    <div className="container-edit py-16 md:py-24">
      <div className="max-w-prose">
        <h1 className="font-display text-4xl">Cookie Policy</h1>
        <p className="mt-4 text-steel">
          We use cookies and similar technologies to run the site, remember your preferences, and understand
          how it's used. You can change your preferences at any time from the cookie banner or this page.
        </p>

        <div className="mt-10 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
          {categories.map((c) => (
            <div key={c.name} className="flex items-start justify-between gap-6 py-5">
              <div>
                <h2 className="text-base">{c.name}</h2>
                <p className="mt-1 text-sm text-steel">{c.desc}</p>
              </div>
              <label className="mt-1 inline-flex shrink-0 items-center">
                <input type="checkbox" defaultChecked disabled={c.required} className="h-4 w-4" />
              </label>
            </div>
          ))}
        </div>

        <button className="mt-8 bg-ink px-7 py-3.5 text-sm text-paper transition hover:bg-inkSoft dark:bg-paper dark:text-ink">
          Save Preferences
        </button>
      </div>
    </div>
  );
}
