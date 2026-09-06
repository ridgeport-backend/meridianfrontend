import React from "react";

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

// Shows a strikethrough original price next to the current price when a
// discount is set (vehicle.originalPrice > vehicle.price). Falls back to a
// plain price when there's no discount. `size` controls text scale so this
// can be reused on both compact cards and the large detail-page price.
export default function PriceDisplay({ price, originalPrice, currency = "USD", size = "md" }) {
  const hasDiscount = originalPrice && originalPrice > price;
  const percentOff = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0;

  const priceClass = size === "lg" ? "font-display text-4xl" : "font-display text-lg";
  const originalClass = size === "lg" ? "text-lg text-steel line-through" : "text-sm text-steel line-through";

  if (!hasDiscount) {
    return <span className={priceClass}>{formatPrice(price, currency)}</span>;
  }

  return (
    <span className="inline-flex flex-wrap items-baseline gap-2">
      <span className={originalClass}>{formatPrice(originalPrice, currency)}</span>
      <span className={`${priceClass} text-accent`}>{formatPrice(price, currency)}</span>
      <span className="rounded bg-accent/15 px-1.5 py-0.5 text-xs font-medium text-accent">
        {percentOff}% off
      </span>
    </span>
  );
}