import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import VehicleCard from "../components/VehicleCard.jsx";
import ReviewCard from "../components/ReviewCard.jsx";
import { mockVehicles, categories, regions } from "../data/mockVehicles.js";
import { mockReviews, overallAverageRating } from "../data/mockReviews.js";
import { fetchVehicles } from "../lib/vehiclesApi.js";
import { fetchRecentReviews } from "../lib/reviewsApi.js";

export default function Home() {
  const [featured, setFeatured] = useState(mockVehicles.filter((v) => v.featured));
  const [reviews, setReviews] = useState(mockReviews.slice(0, 6));
  const [avgRating, setAvgRating] = useState(overallAverageRating);

  useEffect(() => {
    let cancelled = false;
    fetchVehicles({ featured: true, limit: 4 }).then((data) => {
      if (cancelled) return;
      if (data && Array.isArray(data.items) && data.items.length > 0) {
        setFeatured(data.items);
      }
      // else: keep the mock fallback already in state
    });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchRecentReviews(6).then((res) => {
      if (cancelled) return;
      if (res.ok && res.data.reviews.length > 0) {
        const normalized = res.data.reviews.map((r) => ({
          id: r._id,
          rating: r.rating,
          title: r.title,
          body: r.body,
          author: r.customer?.name || "Customer",
          date: r.createdAt,
          verified: r.verifiedPurchase,
        }));
        setReviews(normalized);
        setAvgRating(normalized.reduce((sum, r) => sum + r.rating, 0) / normalized.length);
      }
      // else: keep the mock fallback already in state
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-line dark:border-lineDark">
        <div className="container-edit grid gap-10 py-14 md:grid-cols-2 md:items-center md:py-24">
          <div>
            <p className="text-sm tracking-wide text-steel">Inspected. Prepared. Delivered worldwide.</p>
            <h1 className="mt-4 font-display text-4xl leading-[1.1] md:text-6xl">
              Find your next
              <br />
              exceptional drive.
            </h1>
            <p className="mt-6 max-w-md text-steel">
              Meridian sources and inspects premium pre-owned vehicles for customers across the
              United States, Europe, and Asia — with financing and international shipping
              arranged end to end.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/inventory" className="bg-ink px-7 py-3.5 text-sm text-paper transition hover:bg-inkSoft dark:bg-paper dark:text-ink dark:hover:bg-paper/90">
                Browse Vehicles
              </Link>
              <Link to="/inventory?category=Electric" className="border border-ink px-7 py-3.5 text-sm transition hover:bg-ink hover:text-paper dark:border-paper dark:hover:bg-paper dark:hover:text-ink">
                Shop Electric
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden bg-paperDim dark:bg-inkSoft">
            <img
              src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1400&q=80"
              alt="Featured vehicle"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Region shortcuts */}
      <section className="border-b border-line bg-paperDim/60 py-10 dark:border-lineDark dark:bg-inkSoft/40">
        <div className="container-edit grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {regions.map((r) => (
            <Link
              key={r.value}
              to={`/inventory?${r.value === "__electric" ? "category=Electric" : `region=${r.value}`}`}
              className="group flex items-center justify-between border border-line bg-paper px-6 py-5 transition hover:border-ink dark:border-lineDark dark:bg-ink dark:hover:border-paper"
            >
              <span className="text-base">{r.name}</span>
              <span className="text-sm text-steel">{r.count} listed →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="container-edit py-16 md:py-24">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl">Featured Vehicles</h2>
          <Link to="/inventory" className="text-sm text-steel hover:text-accent">View all →</Link>
        </div>
        <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((v) => (
            <VehicleCard key={v._id} vehicle={v} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-line bg-paperDim/60 py-16 dark:border-lineDark dark:bg-inkSoft/40 md:py-24">
        <div className="container-edit">
          <h2 className="font-display text-3xl">Shop by Category</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.value}
                to={`/inventory?category=${encodeURIComponent(c.value)}`}
                className="group flex items-center justify-between border border-line bg-paper px-6 py-6 transition hover:border-ink dark:border-lineDark dark:bg-ink dark:hover:border-paper"
              >
                <span className="text-lg">{c.name}</span>
                <span className="text-sm text-steel">{c.count} available</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="container-edit py-16 md:py-24">
        <div className="grid gap-10 sm:grid-cols-3">
          {[
            { title: "150-point inspection", body: "Every vehicle is inspected and reconditioned before listing." },
            { title: "Worldwide shipping", body: "Door-to-door delivery arranged across dozens of countries." },
            { title: "Transparent financing", body: "Clear terms, no surprises, with financing partners on request." },
          ].map((f) => (
            <div key={f.title}>
              <h3 className="text-lg">{f.title}</h3>
              <p className="mt-2 text-sm text-steel">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-line py-16 dark:border-lineDark md:py-24">
        <div className="container-edit">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl">What customers say</h2>
              <p className="mt-1 text-sm text-steel">
                {avgRating.toFixed(1)} average rating from verified purchases over the past five years
              </p>
            </div>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <ReviewCard key={r.id} review={r} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}