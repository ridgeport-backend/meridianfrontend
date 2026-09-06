import React, { useMemo, useState } from "react";

const faqs = [
  {
    section: "Buying a vehicle",
    items: [
      { q: "How are vehicles inspected before listing?", a: "Every vehicle passes a 150-point inspection covering mechanical, electrical, and cosmetic condition before it's listed for sale. Inspection reports are available on request." },
      { q: "Can I request a video walkaround?", a: "Yes. Use the \"Request Video\" option on any vehicle's detail page and our team will send a walkaround video within one business day." },
      { q: "Is the listed price negotiable?", a: "Listed prices reflect current market condition and inspection results. For fleet or multi-vehicle purchases, contact our sales team directly." },
    ],
  },
  {
    section: "Payment & financing",
    items: [
      { q: "What payment methods are accepted?", a: "We accept bank transfer and card payment through our secure, provider-hosted checkout. Card details are never stored on our servers." },
      { q: "Is financing available?", a: "Financing is available on select vehicles through our partner lenders, shown as an estimated monthly payment on eligible listings. Final terms depend on a credit check." },
    ],
  },
  {
    section: "Shipping & delivery",
    items: [
      { q: "Do you ship internationally?", a: "Yes, we arrange door-to-door delivery to dozens of countries. Shipping cost and estimated delivery window are shown at checkout based on your destination." },
      { q: "How do I track my order?", a: "Once your order ships, tracking details appear in your account under My Orders, along with a status timeline from payment through delivery." },
    ],
  },
  {
    section: "Account & orders",
    items: [
      { q: "Do I need an account to browse vehicles?", a: "No — browsing and searching inventory is open to everyone. You'll need an account to add a vehicle to your cart, save favorites, or check out." },
      { q: "How do I return or cancel an order?", a: "Contact support within 48 hours of purchase. Return eligibility depends on order status — orders already in transit follow a different process, outlined in your order confirmation." },
    ],
  },
];

export default function Help() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return faqs;
    const q = query.toLowerCase();
    return faqs
      .map((section) => ({
        ...section,
        items: section.items.filter((i) => i.q.toLowerCase().includes(q) || i.a.toLowerCase().includes(q)),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <div className="container-edit py-16 md:py-24">
      <div className="max-w-xl">
        <h1 className="font-display text-4xl">Help Center</h1>
        <p className="mt-3 text-steel">Answers on buying, payment, shipping, and your account.</p>
        <input
          type="search"
          placeholder="Search the help center"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mt-6 w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark"
        />
      </div>

      <div className="mt-12 space-y-12">
        {filtered.map((section) => (
          <div key={section.section}>
            <h2 className="text-lg">{section.section}</h2>
            <div className="mt-4 divide-y divide-line dark:divide-lineDark border-t border-b border-line dark:border-lineDark">
              {section.items.map((item) => (
                <details key={item.q} className="group py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between text-sm">
                    {item.q}
                    <span className="ml-4 text-steel transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-steel">{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-steel">No results for "{query}". Try a different search or contact support.</p>
        )}
      </div>
    </div>
  );
}
