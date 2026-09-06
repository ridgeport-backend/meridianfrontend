import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useOrders } from "../context/OrdersContext.jsx";
import { createOrder as apiCreateOrder } from "../lib/ordersApi.js";

function formatPrice(price, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

const steps = ["Customer Information", "Delivery", "Shipping", "Payment", "Confirmation"];

const paymentMethods = [
  { id: "bank_transfer", label: "Bank Transfer", detail: "Direct wire from your bank" },
  { id: "cashapp", label: "CashApp", detail: "Send from the CashApp app" },
];

export default function Checkout() {
  const { items, subtotal, clear, usingLiveCart } = useCart();
  const { isAuthenticated, user, token } = useAuth();
  const { createOrder: createLocalOrder } = useOrders();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [paymentMethod, setPaymentMethod] = useState("bank_transfer");
  const [placedOrders, setPlacedOrders] = useState([]);
  const [placing, setPlacing] = useState(false);
  const [placeError, setPlaceError] = useState("");

  // A reference code shown to the customer before they place the order, so
  // it can be included in the bank transfer memo / CashApp note, and then
  // matched by an admin against the incoming payment to approve the order.
  const pendingReference = useMemo(() => "MRD-" + Math.random().toString(10).slice(2, 8), []);

  if (!isAuthenticated) {
    navigate("/login", { state: { from: "/checkout" }, replace: true });
    return null;
  }
  if (items.length === 0 && step < 4) {
    navigate("/inventory", { replace: true });
    return null;
  }

  const shippingCost = shippingMethod === "express" ? 1200 : 600;
  const taxes = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + taxes;

  async function placeOrder() {
    setPlacing(true);
    setPlaceError("");

    // Cart came from the real backend (vehicles have real Mongo IDs and are
    // actually reserved server-side) — place one real order per vehicle.
    if (usingLiveCart && token) {
      const results = await Promise.all(
        items.map(({ vehicle }) =>
          apiCreateOrder(token, {
            vehicleId: vehicle._id,
            deliveryAddress: {},
            shippingMethod,
            paymentReference: pendingReference,
            paymentMethod,
          })
        )
      );

      const failed = results.find((r) => !r.ok);
      if (failed) {
        setPlacing(false);
        setPlaceError(
          failed.message ||
            (failed.unreachable
              ? "Couldn't reach the server to place your order. Please try again."
              : "Couldn't place your order.")
        );
        return;
      }

      setPlacedOrders(results.map((r) => r.data.order));
      clear();
      setPlacing(false);
      setStep((s) => s + 1);
      return;
    }

    // Fallback: local/mock order (cart wasn't live — e.g. backend
    // unreachable, or using mock vehicle data)
    const order = createLocalOrder({
      items: items.map(({ vehicle, priceAtAdd }) => ({
        vehicleId: vehicle._id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        image: vehicle.images?.[0]?.url,
        price: priceAtAdd,
      })),
      subtotal,
      shippingCost,
      taxes,
      total,
      currency: "USD",
      paymentMethod,
      deliveryAddress: {},
    });
    setPlacedOrders([{ orderNumber: order.orderNumber, paymentReference: order.paymentReference }]);
    clear();
    setPlacing(false);
    setStep((s) => s + 1);
  }

  function next() {
    if (step === steps.length - 2) {
      placeOrder();
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  return (
    <div className="container-edit py-12">
      <ol className="flex flex-wrap gap-x-6 gap-y-2 border-b border-line pb-6 text-sm text-steel dark:border-lineDark">
        {steps.map((s, i) => (
          <li key={s} className={i === step ? "text-ink dark:text-paper" : ""}>{i + 1}. {s}</li>
        ))}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-lg">Customer Information</h2>
              <input defaultValue={user?.name} placeholder="Full name" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              <input defaultValue={user?.email} placeholder="Email" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              <input defaultValue={user?.phone} placeholder="Phone" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg">Delivery Address</h2>
              <input placeholder="Address line 1" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="City" className="border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
                <input placeholder="Postal code" className="border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
              </div>
              <input placeholder="Country" className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-3">
              <h2 className="text-lg">Shipping Options</h2>
              {[
                { id: "standard", label: "Standard shipping", detail: "6–10 weeks", cost: 600 },
                { id: "express", label: "Express shipping", detail: "3–5 weeks", cost: 1200 },
              ].map((opt) => (
                <label key={opt.id} className="flex cursor-pointer items-center justify-between border border-line px-4 py-3 text-sm dark:border-lineDark">
                  <span className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === opt.id}
                      onChange={() => setShippingMethod(opt.id)}
                    />
                    {opt.label} · <span className="text-steel">{opt.detail}</span>
                  </span>
                  <span>{formatPrice(opt.cost)}</span>
                </label>
              ))}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg">Payment</h2>
              <p className="text-sm text-steel">
                Choose how you'd like to pay. After you place the order, it's held as{" "}
                <span className="text-ink dark:text-paper">pending</span> until we confirm your payment has been
                received — usually within one business day — at which point it moves to{" "}
                <span className="text-ink dark:text-paper">completed</span> in your account.
              </p>

              <div className="space-y-3">
                {paymentMethods.map((m) => (
                  <label key={m.id} className="flex cursor-pointer items-center justify-between border border-line px-4 py-3 text-sm dark:border-lineDark">
                    <span className="flex items-center gap-3">
                      <input type="radio" name="payment" checked={paymentMethod === m.id} onChange={() => setPaymentMethod(m.id)} />
                      {m.label} · <span className="text-steel">{m.detail}</span>
                    </span>
                  </label>
                ))}
              </div>

              {paymentMethod === "bank_transfer" ? (
                <div className="border border-line p-4 text-sm dark:border-lineDark">
                  <p className="text-steel">Send a transfer for the total below to:</p>
                  <dl className="mt-3 grid grid-cols-2 gap-y-2">
                    <dt className="text-steel">Account name</dt><dd>Meridian Motorcars Ltd</dd>
                    <dt className="text-steel">Account number</dt><dd>8842 0399 81</dd>
                    <dt className="text-steel">Routing / SWIFT</dt><dd>MRDNUS33</dd>
                    <dt className="text-steel">Bank</dt><dd>First Continental Bank</dd>
                    <dt className="text-steel">Reference</dt><dd className="font-medium">{pendingReference}</dd>
                  </dl>
                  <p className="mt-3 text-xs text-steel">
                    Include the reference above in your transfer memo so we can match it to your order.
                  </p>
                </div>
              ) : (
                <div className="border border-line p-4 text-sm dark:border-lineDark">
                  <p className="text-steel">Send the total below via CashApp to:</p>
                  <dl className="mt-3 grid grid-cols-2 gap-y-2">
                    <dt className="text-steel">Cashtag</dt><dd className="font-medium">$MeridianMotorcars</dd>
                    <dt className="text-steel">Reference</dt><dd className="font-medium">{pendingReference}</dd>
                  </dl>
                  <p className="mt-3 text-xs text-steel">
                    Add the reference above to the payment note in CashApp so we can match it to your order.
                  </p>
                </div>
              )}

              {placeError && <p className="text-sm text-red-600 dark:text-red-400">{placeError}</p>}
            </div>
          )}
          {step === 4 && placedOrders.length > 0 && (
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3 py-1 text-xs text-amber-600 dark:text-amber-400">
                Pending payment confirmation
              </div>
              <h2 className="mt-3 font-display text-2xl">
                {placedOrders.length > 1 ? "Orders placed" : "Order placed"}
              </h2>
              <p className="mt-2 max-w-md text-steel">
                {placedOrders.length > 1 ? (
                  <>Orders {placedOrders.map((o) => o.orderNumber).join(", ")} are now pending.</>
                ) : (
                  <>Order <span className="text-ink dark:text-paper">{placedOrders[0].orderNumber}</span> is now pending.</>
                )}{" "}
                Complete your {paymentMethod === "bank_transfer" ? "bank transfer" : "CashApp payment"} using
                reference <span className="text-ink dark:text-paper">{placedOrders[0].paymentReference}</span>. Once
                we confirm it's received, {placedOrders.length > 1 ? "these orders update" : "this order updates"} to{" "}
                <em>completed</em> automatically — you can follow status any time from{" "}
                <span className="text-ink dark:text-paper">My Account → My Orders</span>.
              </p>
            </div>
          )}

          {step < 4 && (
            <button
              onClick={next}
              disabled={placing}
              className="mt-8 bg-ink px-7 py-3.5 text-sm text-paper transition hover:bg-inkSoft disabled:opacity-60 dark:bg-paper dark:text-ink"
            >
              {step === 3 ? (placing ? "Placing order…" : "Place Order") : "Continue"}
            </button>
          )}
        </div>

        {step < 4 && (
          <div className="h-fit border border-line p-6 dark:border-lineDark">
            <h2 className="text-lg">Order Summary</h2>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-steel">Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-steel">Shipping</span><span>{formatPrice(shippingCost)}</span></div>
              <div className="flex justify-between"><span className="text-steel">Taxes</span><span>{formatPrice(taxes)}</span></div>
            </div>
            <div className="mt-4 flex justify-between border-t border-line pt-4 font-display text-lg dark:border-lineDark">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}