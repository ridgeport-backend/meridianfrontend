import React from "react";

export function Placeholder({ title, body }) {
  return (
    <div className="container-edit py-24">
      <h1 className="font-display text-3xl">{title}</h1>
      <p className="mt-4 max-w-prose text-steel">{body}</p>
    </div>
  );
}
