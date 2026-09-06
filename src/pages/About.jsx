import React from "react";

const stats = [
  { value: "12,400+", label: "Vehicles delivered" },
  { value: "38", label: "Countries served" },
  { value: "150-point", label: "Inspection standard" },
  { value: "4.8/5", label: "Average customer rating" },
];

const values = [
  { title: "Inspected, not just listed", body: "Every vehicle passes a 150-point mechanical, electrical, and cosmetic inspection before it's offered for sale." },
  { title: "Transparent by default", body: "Full service history, condition reports, and photography — no vehicle is listed without documentation to back it up." },
  { title: "Built for international buyers", body: "From export paperwork to destination-country compliance, our team handles the logistics so you don't have to." },
];

export default function About() {
  return (
    <div>
      <section className="border-b border-line py-16 dark:border-lineDark md:py-24">
        <div className="container-edit grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm text-steel">Est. 2014</p>
            <h1 className="mt-3 font-display text-4xl leading-tight md:text-5xl">
              A dealership built for buyers who don't live near the lot.
            </h1>
            <p className="mt-6 max-w-md text-steel">
              Meridian Motorcars started as a small inspection service for expatriates buying cars sight
              unseen. Today we source, inspect, and deliver premium pre-owned vehicles to customers across
              the Americas, Europe, and Asia — every one backed by the same standard of documentation and
              care we started with.
            </p>
          </div>
          <div className="aspect-[4/3] overflow-hidden bg-paperDim dark:bg-inkSoft">
            <img
              src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"
              alt="Meridian inspection bay"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="border-b border-line py-14 dark:border-lineDark">
        <div className="container-edit grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="font-display text-3xl">{s.value}</div>
              <div className="mt-1 text-sm text-steel">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="container-edit py-16 md:py-24">
        <h2 className="font-display text-3xl">What we hold ourselves to</h2>
        <div className="mt-10 grid gap-10 md:grid-cols-3">
          {values.map((v) => (
            <div key={v.title}>
              <h3 className="text-lg">{v.title}</h3>
              <p className="mt-2 text-sm text-steel">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-paperDim/60 py-16 dark:border-lineDark dark:bg-inkSoft/40 md:py-24">
        <div className="container-edit max-w-prose">
          <h2 className="font-display text-3xl">Our inspection process</h2>
          <p className="mt-4 text-steel">
            Before any vehicle is listed, it goes through a structured inspection covering the engine,
            transmission, suspension, electrical systems, safety equipment, and bodywork, along with a full
            review of title and service history. Vehicles that don't meet our standard are declined for
            resale rather than listed with disclosed defects — we'd rather have fewer vehicles on the lot
            than lower the bar.
          </p>
          <p className="mt-4 text-steel">
            Once a vehicle is sold, our logistics team coordinates export documentation, shipping, and
            customs paperwork specific to the destination country, and keeps you updated at every stage
            from your account dashboard.
          </p>
        </div>
      </section>
    </div>
  );
}
