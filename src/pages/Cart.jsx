import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function Cart() {
  const { items, removeItem, subtotal, usingLiveCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Cart is only ever accessible to authenticated users.
  if (!isAuthenticated) {
    navigate("/login", { state: { from: "/cart" }, replace: true });
    return null;
  }

  if (items.length === 0) {
    return (
      <div className="container-edit py-24 text-center">
        <h1 className="font-display text-2xl">Your cart is empty</h1>
        <Link to="/inventory" className="mt-4 inline-block text-sm text-steel underline underline-offset-2 hover:text-ink">
          Browse inventory
        </Link>
      </div>
    );
  }

  return (
    <div className="container-edit py-12">
      <h1 className="font-display text-3xl">Your Cart</h1>
      {!usingLiveCart && (
        <p className="mt-1 text-xs text-steel">Showing a local cart — connect to the backend to persist this across devices.</p>
      )}

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {items.map(({ vehicle, priceAtAdd }) => (
            <div key={vehicle._id} className="flex gap-4 border-b border-line py-6">
              <div className="h-24 w-32 flex-shrink-0 overflow-hidden bg-paperDim dark:bg-inkSoft">
                <img src={vehicle.images[0]?.url} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base">{vehicle.year} {vehicle.make} {vehicle.model}</h3>
                    <p className="text-sm text-steel">{vehicle.location}</p>
                  </div>
                  <span className="font-display text-lg">{formatPrice(priceAtAdd, vehicle.currency)}</span>
                </div>
                <button
                  onClick={() => removeItem(vehicle._id)}
                  className="self-start text-sm text-steel underline underline-offset-2 hover:text-ink"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="h-fit border border-line p-6 dark:border-lineDark">
          <h2 className="text-lg">Order Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-steel">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-steel">Shipping</span><span>Calculated at checkout</span></div>
            <div className="flex justify-between"><span className="text-steel">Taxes</span><span>Calculated at checkout</span></div>
          </div>
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg dark:border-lineDark">
            <span>Total</span><span>{formatPrice(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            className="mt-6 block bg-ink px-6 py-3.5 text-center text-sm text-paper transition hover:bg-inkSoft dark:bg-paper dark:text-ink"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
} 