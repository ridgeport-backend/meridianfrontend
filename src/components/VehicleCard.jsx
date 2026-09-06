import React from "react";
import { Link } from "react-router-dom";
import PriceDisplay from "./PriceDisplay.jsx";

function formatPrice(price, currency) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function VehicleCard({ vehicle }) {
  const mainImage = vehicle.images?.[0]?.url;
  const hasDiscount = vehicle.originalPrice && vehicle.originalPrice > vehicle.price;
  return (
    <Link to={`/vehicles/${vehicle._id}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden bg-paperDim dark:bg-inkSoft">
        {mainImage && (
          <img
            src={mainImage}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {vehicle.isNewArrival && (
            <span className="bg-ink px-2.5 py-1 text-xs text-paper">New Arrival</span>
          )}
          {vehicle.featured && (
            <span className="bg-accent px-2.5 py-1 text-xs text-white">Featured</span>
          )}
          {hasDiscount && (
            <span className="bg-accent px-2.5 py-1 text-xs text-white">Sale</span>
          )}
          {vehicle.status === "sold" && (
            <span className="bg-white px-2.5 py-1 text-xs text-ink">Sold</span>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg leading-snug">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </h3>
          <span className="whitespace-nowrap">
            <PriceDisplay price={vehicle.price} originalPrice={vehicle.originalPrice} currency={vehicle.currency} />
          </span>
        </div>
        <p className="mt-1 text-sm text-steel">
          {vehicle.mileage.toLocaleString()} mi · {vehicle.transmission} · {vehicle.fuelType} · {vehicle.location}
        </p>
        <p className="mt-0.5 text-xs uppercase tracking-wide text-steel/70">{vehicle.category} · {vehicle.region}</p>
        {vehicle.financingAvailable && vehicle.estimatedMonthlyPayment && (
          <p className="mt-1 text-sm text-steel">
            Est. {formatPrice(vehicle.estimatedMonthlyPayment, vehicle.currency)}/mo
          </p>
        )}
      </div>
    </Link>
  );
}