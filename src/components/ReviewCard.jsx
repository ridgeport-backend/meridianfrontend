import React from "react";

function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-accent" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i <= rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1">
          <path d="M10 1.5l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1-5.4 3.1 1.3-6-4.6-4.1 6.1-.6L10 1.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function ReviewCard({ review }) {
  const date = new Date(review.date).toLocaleDateString(undefined, { year: "numeric", month: "long" });
  return (
    <div className="border border-line p-6 dark:border-lineDark">
      <div className="flex items-center justify-between">
        <Stars rating={review.rating} />
        {review.verified && (
          <span className="text-[11px] uppercase tracking-wide text-steel">Verified purchase</span>
        )}
      </div>
      <h3 className="mt-3 text-base">{review.title}</h3>
      <p className="mt-2 text-sm text-steel">{review.body}</p>
      <p className="mt-4 text-xs text-steel">{review.author} · {date}</p>
    </div>
  );
}
