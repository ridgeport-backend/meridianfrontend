import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const OrdersContext = createContext(null);
const STORAGE_KEY = "dealership_orders";

function loadOrders() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

function generateOrderNumber() {
  return "ORD-" + Math.random().toString(16).slice(2, 8).toUpperCase();
}

function generatePaymentReference() {
  return "MRD-" + Math.random().toString(10).slice(2, 8);
}

// Frontend-only demo of a manual payment flow: the customer places an order
// against a bank transfer or CashApp reference, which starts out "pending".
// An admin marks it approved once the payment is confirmed received, and the
// status change syncs back to the customer's Account page in real time via
// the same cross-tab localStorage pattern used by SupportContext. In
// production this is the Order model + orderController already scaffolded
// in the backend, with a real payment reconciliation step in place of the
// manual admin click.
export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders);
  const { user } = useAuth();

  useEffect(() => {
    function onStorage(e) {
      if (e.key === STORAGE_KEY) setOrders(loadOrders());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next) => {
    setOrders(next);
    saveOrders(next);
  }, []);

  const createOrder = useCallback(
    ({ items, subtotal, shippingCost, taxes, total, currency, paymentMethod, deliveryAddress }) => {
      const now = new Date().toISOString();
      const order = {
        orderNumber: generateOrderNumber(),
        paymentReference: generatePaymentReference(),
        customerEmail: user?.email || "guest@example.com",
        customerName: user?.name || "Guest",
        items,
        subtotal,
        shippingCost,
        taxes,
        total,
        currency: currency || "USD",
        paymentMethod, // "bank_transfer" | "cashapp"
        deliveryAddress,
        status: "pending", // pending -> completed | cancelled
        createdAt: now,
        updatedAt: now,
        timeline: [{ status: "pending", note: "Order placed, awaiting payment confirmation", at: now }],
      };
      persist([order, ...orders]);
      return order;
    },
    [orders, user, persist]
  );

  const approveOrder = useCallback(
    (orderNumber) => {
      const now = new Date().toISOString();
      const next = orders.map((o) =>
        o.orderNumber === orderNumber
          ? {
              ...o,
              status: "completed",
              updatedAt: now,
              timeline: [...o.timeline, { status: "completed", note: "Payment confirmed by admin", at: now }],
            }
          : o
      );
      persist(next);
    },
    [orders, persist]
  );

  const cancelOrder = useCallback(
    (orderNumber, note = "Order cancelled") => {
      const now = new Date().toISOString();
      const next = orders.map((o) =>
        o.orderNumber === orderNumber
          ? { ...o, status: "cancelled", updatedAt: now, timeline: [...o.timeline, { status: "cancelled", note, at: now }] }
          : o
      );
      persist(next);
    },
    [orders, persist]
  );

  const myOrders = user ? orders.filter((o) => o.customerEmail === user.email) : [];

  return (
    <OrdersContext.Provider value={{ orders, myOrders, createOrder, approveOrder, cancelOrder }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  return useContext(OrdersContext);
}
