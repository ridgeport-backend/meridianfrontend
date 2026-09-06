import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { mockVehicles } from "../data/mockVehicles.js";
import { fetchVehicleById } from "../lib/vehiclesApi.js";
import PriceDisplay from "../components/PriceDisplay.jsx";
import { reviewsForVehicle } from "../data/mockReviews.js";
import { fetchVehicleReviews, submitReview } from "../lib/reviewsApi.js";
import ReviewCard from "../components/ReviewCard.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useFavorites } from "../context/FavoritesContext.jsx";

function formatPrice(price, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

const specRows = [
  ["Make", "make"], ["Model", "model"], ["Trim", "trim"], ["Year", "year"],
  ["Mileage", (v) => `${v.mileage.toLocaleString()} mi`],
  ["Condition", "condition"], ["Exterior", "exteriorColor"], ["Interior", "interiorColor"],
  ["Fuel", "fuelType"], ["Transmission", "transmission"], ["Drivetrain", "drivetrain"],
  ["Engine", "engine"], ["Horsepower", (v) => `${v.horsepower} hp`],
  ["Doors", "doors"], ["Seats", "seats"], ["Location", "location"],
  ["Category", "category"], ["Region", "region"],
];

export default function VehicleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState(() => mockVehicles.find((v) => v._id === id) || null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { isAuthenticated, token } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [actionError, setActionError] = useState("");
  const [liveReviews, setLiveReviews] = useState(null); // null = not loaded / unreachable
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: "", body: "" });
  const [reviewStatus, setReviewStatus] = useState(""); // "", "submitting", "submitted", "error"
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVehicleById(id).then((liveVehicle) => {
      if (cancelled) return;
      if (liveVehicle) {
        setVehicle(liveVehicle);
      } else if (!vehicle) {
        // Not in mock data either, and API unreachable/404 — leave as null
        setVehicle(mockVehicles.find((v) => v._id === id) || null);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const vehicleReviews = liveReviews !== null ? liveReviews : (vehicle ? reviewsForVehicle(vehicle._id) : []);
  const avgRating = vehicleReviews.length > 0
    ? vehicleReviews.reduce((sum, r) => sum + r.rating, 0) / vehicleReviews.length
    : null;

  useEffect(() => {
    let cancelled = false;
    if (!vehicle) return;
    fetchVehicleReviews(vehicle._id).then((res) => {
      if (cancelled) return;
      if (res.ok) {
        setLiveReviews(
          res.data.reviews.map((r) => ({
            id: r._id,
            rating: r.rating,
            title: r.title,
            body: r.body,
            author: r.customer?.name || "Customer",
            date: r.createdAt,
            verified: r.verifiedPurchase,
          }))
        );
      }
      // unreachable/error: leave liveReviews as null so the mock fallback above is used
    });
    return () => { cancelled = true; };
  }, [vehicle]);

  function handleReviewSubmit(e) {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!reviewForm.title.trim() || !reviewForm.body.trim()) {
      setReviewStatus("error");
      setReviewError("Add a title and a few words about your experience.");
      return;
    }
    setReviewStatus("submitting");
    setReviewError("");
    submitReview(token, { vehicleId: vehicle._id, ...reviewForm }).then((res) => {
      if (res.ok) {
        setReviewStatus("submitted");
        setReviewForm({ rating: 5, title: "", body: "" });
      } else {
        setReviewStatus("error");
        setReviewError(
          res.unreachable ? "Couldn't reach the server — please try again shortly." : res.message || "Couldn't submit your review."
        );
      }
    });
  }

  if (!vehicle) {
    if (loading) return <div className="container-edit py-24 text-center text-steel">Loading…</div>;
    return <div className="container-edit py-24 text-center text-steel">Vehicle not found.</div>;
  }

  function requireAuth(destination) {
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/vehicles/${vehicle._id}` } });
      return false;
    }
    return true;
  }

  function handleAddToCart() {
    if (!requireAuth()) return;
    setActionError("");
    addItem(vehicle).then((result) => {
      if (result.ok) navigate("/cart");
      else setActionError(result.message || "Couldn't add this vehicle to your cart.");
    });
  }

  function handleBuyNow() {
    if (!requireAuth()) return;
    setActionError("");
    addItem(vehicle).then((result) => {
      if (result.ok) navigate("/checkout");
      else setActionError(result.message || "Couldn't start checkout for this vehicle.");
    });
  }

  return (
    <div className="container-edit py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div>
          <div className="aspect-[4/3] overflow-hidden bg-paperDim dark:bg-inkSoft">
            <img
              src={vehicle.images[activeImage]?.url}
              alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
              className="h-full w-full object-cover"
            />
          </div>
          {vehicle.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {vehicle.images.map((img, i) => (
                <button
                  key={img._id}
                  onClick={() => setActiveImage(i)}
                  className={`h-20 w-28 overflow-hidden border ${
                    i === activeImage ? "border-ink dark:border-paper" : "border-line dark:border-lineDark"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-steel">{vehicle.location}, {vehicle.country}</p>
          <h1 className="mt-1 font-display text-3xl">
            {vehicle.year} {vehicle.make} {vehicle.model} {vehicle.trim}
          </h1>
          {avgRating && (
            <p className="mt-1 text-sm text-steel">★ {avgRating.toFixed(1)} · {vehicleReviews.length} review{vehicleReviews.length !== 1 ? "s" : ""}</p>
          )}

          <div className="mt-6 border-y border-line py-6 dark:border-lineDark">
            <div>
              <PriceDisplay price={vehicle.price} originalPrice={vehicle.originalPrice} currency={vehicle.currency} size="lg" />
            </div>
            {vehicle.financingAvailable && (
              <p className="mt-2 text-sm text-steel">
                Financing available · est. {formatPrice(vehicle.estimatedMonthlyPayment, vehicle.currency)}/mo
              </p>
            )}
            <p className="mt-1 text-xs text-steel">
              Price excludes shipping, taxes, and destination fees, calculated at checkout.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleBuyNow}
              disabled={vehicle.status !== "available"}
              className="bg-accent px-7 py-3.5 text-sm text-white transition hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-40"
            >
              {vehicle.status === "available" ? "Buy Now" : "Sold"}
            </button>
            <button
              onClick={handleAddToCart}
              disabled={vehicle.status !== "available"}
              className="bg-ink px-7 py-3.5 text-sm text-paper transition hover:bg-inkSoft disabled:cursor-not-allowed disabled:opacity-40 dark:bg-paper dark:text-ink"
            >
              Add to Cart
            </button>
            <button className="border border-ink px-7 py-3.5 text-sm transition hover:bg-ink hover:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-ink">
              Request Information
            </button>
            <button
              onClick={() => requireAuth() && toggleFavorite(vehicle)}
              className="border border-line px-7 py-3.5 text-sm text-steel transition hover:border-ink hover:text-ink dark:border-lineDark dark:hover:border-paper dark:hover:text-paper"
            >
              {isAuthenticated && isFavorite(vehicle._id) ? "★ Saved" : "☆ Save Vehicle"}
            </button>
          </div>
          {!isAuthenticated && (
            <p className="mt-3 text-xs text-steel">You'll need to sign in to buy or add this vehicle to your cart.</p>
          )}
          {actionError && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">{actionError}</p>
          )}

          <p className="mt-8 text-sm leading-relaxed text-steel">{vehicle.description}</p>

          {/* Specs */}
          <h2 className="mt-10 text-lg">Specifications</h2>
          <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 border-t border-line pt-4 text-sm dark:border-lineDark">
            {specRows.map(([label, accessor]) => (
              <div key={label} className="border-b border-line pb-3 dark:border-lineDark">
                <dt className="text-steel">{label}</dt>
                <dd className="mt-0.5">{typeof accessor === "function" ? accessor(vehicle) : vehicle[accessor]}</dd>
              </div>
            ))}
          </dl>

          {vehicle.features?.length > 0 && (
            <>
              <h2 className="mt-10 text-lg">Features</h2>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-steel">
                {vehicle.features.map((f) => (
                  <li key={f}>· {f}</li>
                ))}
              </ul>
            </>
          )}

          {vehicleReviews.length > 0 && (
            <>
              <h2 className="mt-10 text-lg">Customer Reviews</h2>
              <div className="mt-4 space-y-4">
                {vehicleReviews.map((r) => (
                  <ReviewCard key={r.id} review={r} />
                ))}
              </div>
            </>
          )}

          <h2 className="mt-10 text-lg">Write a Review</h2>
          {reviewStatus === "submitted" ? (
            <p className="mt-4 text-sm text-steel">
              Thanks — your review has been submitted and will appear here once approved.
            </p>
          ) : (
            <form onSubmit={handleReviewSubmit} className="mt-4 max-w-md space-y-3">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wide text-steel">Rating</label>
                <select
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                  className="border border-line bg-transparent px-3 py-2 text-sm dark:border-lineDark"
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>{n} star{n !== 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <input
                placeholder="Title"
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark"
              />
              <textarea
                rows={4}
                placeholder="Share your experience with this vehicle"
                value={reviewForm.body}
                onChange={(e) => setReviewForm((f) => ({ ...f, body: e.target.value }))}
                className="w-full border border-line bg-transparent px-4 py-3 text-sm dark:border-lineDark"
              />
              {reviewStatus === "error" && <p className="text-sm text-red-600 dark:text-red-400">{reviewError}</p>}
              <button
                type="submit"
                disabled={reviewStatus === "submitting"}
                className="bg-ink px-6 py-3 text-sm text-paper transition hover:bg-inkSoft disabled:opacity-60 dark:bg-paper dark:text-ink"
              >
                {reviewStatus === "submitting" ? "Submitting…" : "Submit Review"}
              </button>
              {!isAuthenticated && (
                <p className="text-xs text-steel">You'll be asked to sign in when you submit.</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}