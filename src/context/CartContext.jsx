import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { getCart, addToCart as apiAddToCart, removeFromCart as apiRemoveFromCart } from "../lib/cartApi.js";

const CartContext = createContext(null);

function normalizeItems(rawItems) {
  return (rawItems || []).map((i) => ({ vehicle: i.vehicle, priceAtAdd: i.priceAtAdd }));
}

export function CartProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [items, setItems] = useState([]);
  const [usingLiveCart, setUsingLiveCart] = useState(false);
  const [error, setError] = useState("");

  // Load the real cart on sign-in. If the API is unreachable (backend down,
  // or a mock-auth token from authClient's local fallback that the real
  // backend won't recognize), we just keep whatever's in local state instead
  // of erroring out.
  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || !token) {
      setItems([]);
      setUsingLiveCart(false);
      return;
    }
    getCart(token).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setItems(normalizeItems(res.data.cart.items));
        setUsingLiveCart(true);
      } else {
        setUsingLiveCart(false);
      }
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, token]);

  const addItem = useCallback(
    async (vehicle) => {
      setError("");
      if (isAuthenticated && token) {
        const res = await apiAddToCart(token, vehicle._id);
        if (res.ok) {
          setItems(normalizeItems(res.data.cart.items));
          setUsingLiveCart(true);
          return { ok: true };
        }
        if (!res.unreachable) {
          // Real rejection from the API — e.g. someone else just reserved
          // this single-stock vehicle, or the session token is invalid.
          // Surface it instead of silently falling back.
          setError(res.message || "Couldn't add this vehicle to your cart.");
          return { ok: false, message: res.message };
        }
        // API unreachable — fall through to local-only behavior below.
      }
      setItems((prev) => {
        if (prev.some((i) => i.vehicle._id === vehicle._id)) return prev;
        return [...prev, { vehicle, priceAtAdd: vehicle.price }];
      });
      setUsingLiveCart(false);
      return { ok: true };
    },
    [isAuthenticated, token]
  );

  const removeItem = useCallback(
    async (vehicleId) => {
      if (isAuthenticated && token && usingLiveCart) {
        const res = await apiRemoveFromCart(token, vehicleId);
        if (res.ok) {
          setItems(normalizeItems(res.data.cart.items));
          return;
        }
      }
      setItems((prev) => prev.filter((i) => i.vehicle._id !== vehicleId));
    },
    [isAuthenticated, token, usingLiveCart]
  );

  function clear() {
    // Clears the locally displayed cart after an order is placed. Since
    // order placement itself isn't wired to the real API yet (see
    // OrdersContext), this doesn't call the backend — that's the next
    // integration step once checkout/orders connect for real.
    setItems([]);
  }

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.priceAtAdd, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clear, subtotal, isAuthenticated, usingLiveCart, error }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}