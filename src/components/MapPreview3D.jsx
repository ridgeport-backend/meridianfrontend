import React from "react";

// A stylized, dependency-free 3D map mockup (CSS perspective/transform).
// For a production build, swap this for a real interactive map — e.g.
// Mapbox GL JS or Google Maps with the "tilt" API — using an API key
// configured from the admin panel.
export default function MapPreview3D() {
  return (
    <div
      className="relative aspect-[4/3] overflow-hidden bg-paperDim dark:bg-inkSoft"
      style={{ perspective: "800px" }}
      role="img"
      aria-label="Stylized 3D map showing the Meridian Motorcars showroom location"
    >
      <div
        className="absolute inset-0"
        style={{
          transform: "rotateX(55deg) rotateZ(-8deg) scale(1.4)",
          transformStyle: "preserve-3d",
          backgroundImage:
            "linear-gradient(var(--map-line, rgba(125,129,138,0.25)) 1px, transparent 1px), linear-gradient(90deg, var(--map-line, rgba(125,129,138,0.25)) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />
      {/* streets */}
      <div
        className="absolute left-1/2 top-0 h-full w-3 -translate-x-1/2 bg-steel/25"
        style={{ transform: "rotateX(55deg) rotateZ(-8deg) scale(1.4)" }}
      />
      <div
        className="absolute left-0 top-1/2 h-3 w-full -translate-y-1/2 bg-steel/25"
        style={{ transform: "rotateX(55deg) rotateZ(-8deg) scale(1.4)" }}
      />
      {/* blocks */}
      {[
        { top: "22%", left: "28%", w: 34, h: 22 },
        { top: "58%", left: "18%", w: 26, h: 30 },
        { top: "20%", left: "62%", w: 40, h: 18 },
        { top: "60%", left: "60%", w: 28, h: 24 },
      ].map((b, i) => (
        <div
          key={i}
          className="absolute bg-ink/20 dark:bg-paper/20"
          style={{
            top: b.top,
            left: b.left,
            width: b.w,
            height: b.h,
            transform: "rotateX(55deg) rotateZ(-8deg) scale(1.4) translateZ(6px)",
          }}
        />
      ))}
      {/* location pin */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
        <div className="h-4 w-4 rotate-45 rounded-tl-full rounded-tr-full rounded-br-full bg-accent shadow-md" />
        <div className="mx-auto mt-1 h-2 w-2 rounded-full bg-ink/20 dark:bg-paper/20" />
      </div>
      <div className="absolute bottom-3 left-3 bg-paper/90 px-3 py-1.5 text-xs text-ink dark:bg-ink/90 dark:text-paper">
        Meridian Motorcars Showroom
      </div>
    </div>
  );
}
