import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import VehicleCard from "../components/VehicleCard.jsx";
import { mockVehicles, categories as mockCategories, regions as mockRegions } from "../data/mockVehicles.js";
import { fetchVehicles } from "../lib/vehiclesApi.js";

const sortOptions = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "mileage_asc", label: "Mileage: Low to High" },
];

export default function Inventory() {
  const [params, setParams] = useSearchParams();
  const [sort, setSort] = useState("newest");
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [loading, setLoading] = useState(true);

  const category = params.get("category");
  const region = params.get("region");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVehicles({ category, region, sort }).then((data) => {
      if (cancelled) return;
      if (data && Array.isArray(data.items)) {
        setVehicles(data.items);
        setUsingLiveData(true);
      } else {
        // API unreachable — fall back to local mock data, filtered client-side
        let list = [...mockVehicles];
        if (category) list = list.filter((v) => v.category === category);
        if (region) list = list.filter((v) => v.region === region);
        setVehicles(list);
        setUsingLiveData(false);
      }
      setLoading(false);
    });
    return () => { cancelled = true; };
  }, [category, region, sort]);

  const sorted = useMemo(() => {
    const list = [...vehicles];
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    if (sort === "mileage_asc") list.sort((a, b) => a.mileage - b.mileage);
    return list;
  }, [vehicles, sort]);

  const title = category || region || "All Vehicles";

  function setFilter(key, value) {
    const next = new URLSearchParams(params);
    next.delete("category");
    next.delete("region");
    if (value) next.set(key, value);
    setParams(next);
  }

  return (
    <div className="container-edit py-12">
      <div className="flex flex-col gap-4 border-b border-line pb-6 dark:border-lineDark sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-steel">
            {loading ? "Loading…" : `${sorted.length} vehicles available`}
            {!loading && !usingLiveData && " · showing sample inventory"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="text-sm text-steel">Sort by</label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="border border-line bg-paper px-3 py-2 text-sm dark:border-lineDark dark:bg-ink"
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Filter chips */}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("category", null)}
          className={`border px-4 py-1.5 text-sm ${!category && !region ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink" : "border-line text-steel dark:border-lineDark"}`}
        >
          All
        </button>
        {mockRegions.filter((r) => r.value !== "__electric").map((r) => (
          <button
            key={r.value}
            onClick={() => setFilter("region", r.value)}
            className={`border px-4 py-1.5 text-sm ${region === r.value ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink" : "border-line text-steel dark:border-lineDark"}`}
          >
            {r.name}
          </button>
        ))}
        {mockCategories.map((c) => (
          <button
            key={c.value}
            onClick={() => setFilter("category", c.value)}
            className={`border px-4 py-1.5 text-sm ${category === c.value ? "border-ink bg-ink text-paper dark:border-paper dark:bg-paper dark:text-ink" : "border-line text-steel dark:border-lineDark"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((v) => (
          <VehicleCard key={v._id} vehicle={v} />
        ))}
      </div>

      {!loading && sorted.length === 0 && (
        <p className="mt-16 text-center text-steel">No vehicles match this filter yet.</p>
      )}
    </div>
  );
}