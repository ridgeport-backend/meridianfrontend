import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { fetchVehicles, deleteVehicle } from "../lib/vehiclesApi.js";

function formatPrice(n, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export default function AdminVehicles() {
  const { token } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    fetchVehicles({ limit: 100, sort: "newest" }).then((data) => {
      setVehicles(data?.items || []);
      setLoading(false);
    });
  }

  useEffect(load, []);

  async function handleDelete(vehicle) {
    if (!window.confirm(`Delete ${vehicle.year} ${vehicle.make} ${vehicle.model}? This can't be undone.`)) return;
    const res = await deleteVehicle(token, vehicle._id);
    if (res.ok) {
      setVehicles((prev) => prev.filter((v) => v._id !== vehicle._id));
    } else {
      setError(res.message || "Couldn't delete this vehicle.");
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Vehicles</h1>
          <p className="mt-1 text-sm text-steel">
            Note: this list shows available/sold listings — hidden listings aren't returned by the public
            search endpoint yet.
          </p>
        </div>
        <Link to="/admin/vehicles/new" className="bg-ink px-5 py-2.5 text-sm text-paper dark:bg-paper dark:text-ink">
          + Add Vehicle
        </Link>
      </div>

      {error && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>}

      {loading ? (
        <p className="mt-8 text-sm text-steel">Loading…</p>
      ) : (
        <div className="mt-8 divide-y divide-line border-y border-line dark:divide-lineDark dark:border-lineDark">
          {vehicles.map((v) => (
            <div key={v._id} className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm">
              <div className="flex items-center gap-4">
                <div className="h-14 w-20 overflow-hidden bg-paperDim dark:bg-inkSoft">
                  {v.images?.[0]?.url && <img src={v.images[0].url} alt="" className="h-full w-full object-cover" />}
                </div>
                <div>
                  <div>{v.year} {v.make} {v.model} {v.trim}</div>
                  <div className="text-xs text-steel">{v.category} · {v.region} · {v.stockNumber}</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span>{formatPrice(v.price, v.currency)}</span>
                <span className="text-xs capitalize text-steel">{v.status}</span>
                <Link to={`/admin/vehicles/${v._id}/edit`} className="text-xs underline underline-offset-2">Edit</Link>
                <button onClick={() => handleDelete(v)} className="text-xs text-red-600 underline underline-offset-2 dark:text-red-400">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {vehicles.length === 0 && <p className="py-4 text-sm text-steel">No vehicles yet.</p>}
        </div>
      )}
    </div>
  );
}