import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { getFavorites, addFavorite as apiAddFavorite, removeFavorite as apiRemoveFavorite } from "../lib/favoritesApi.js";

const FavoritesContext = createContext(null);

// Stores full vehicle objects (not just IDs) so the Account page can render
// them directly — either populated by the real API, or, in the local
// fallback case, whatever vehicle object was passed to toggleFavorite at the
// time (e.g. from a mock-data page if the API was unreachable).
export function FavoritesProvider({ children }) {
  const { user, token, isAuthenticated } = useAuth();
  const storageKey = user ? `dealership_favorites_${user.email}` : null;
  const [favorites, setFavorites] = useState([]);
  const [usingLiveFavorites, setUsingLiveFavorites] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!isAuthenticated || !token) {
      setFavorites([]);
      setUsingLiveFavorites(false);
      return;
    }
    getFavorites(token).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setFavorites(res.data.vehicles);
        setUsingLiveFavorites(true);
      } else {
        setUsingLiveFavorites(false);
        try {
          setFavorites(JSON.parse(localStorage.getItem(storageKey)) || []);
        } catch {
          setFavorites([]);
        }
      }
    });
    return () => { cancelled = true; };
  }, [isAuthenticated, token, storageKey]);

  const toggleFavorite = useCallback(
    async (vehicle) => {
      const alreadySaved = favorites.some((v) => v._id === vehicle._id);

      if (isAuthenticated && token && usingLiveFavorites) {
        const res = alreadySaved
          ? await apiRemoveFavorite(token, vehicle._id)
          : await apiAddFavorite(token, vehicle._id);
        if (res.ok) {
          setFavorites(res.data.vehicles);
          return;
        }
        // fall through to local behavior if the API call itself failed
      }

      const next = alreadySaved ? favorites.filter((v) => v._id !== vehicle._id) : [...favorites, vehicle];
      setFavorites(next);
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [favorites, isAuthenticated, token, usingLiveFavorites, storageKey]
  );

  function isFavorite(vehicleId) {
    return favorites.some((v) => v._id === vehicleId);
  }

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite, usingLiveFavorites }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}