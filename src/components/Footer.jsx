import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-ink text-paper dark:border-lineDark">
      <div className="container-edit grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="font-display text-2xl">Meridian</div>
          <p className="mt-3 max-w-xs text-sm text-paper/60">
            Quality inspected pre-owned vehicles, prepared and shipped to customers worldwide.
          </p>
        </div>
        <div>
          <div className="text-sm font-medium text-paper/90">Shop</div>
          <ul className="mt-3 space-y-2 text-sm text-paper/60">
            <li><Link to="/inventory">Inventory</Link></li>
            <li><Link to="/inventory?category=Electric">Electric Vehicles</Link></li>
            <li><Link to="/inventory?region=USA">USA Vehicles</Link></li>
            <li><Link to="/inventory?region=Europe">European Vehicles</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium text-paper/90">Company</div>
          <ul className="mt-3 space-y-2 text-sm text-paper/60">
            <li><Link to="/about">About</Link></li>
            <li><Link to="/help">Help Center</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-sm font-medium text-paper/90">Legal</div>
          <ul className="mt-3 space-y-2 text-sm text-paper/60">
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/cookies">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-6 text-center text-xs text-paper/40">
        © {new Date().getFullYear()} Meridian Motorcars. All rights reserved.
      </div>
    </footer>
  );
}
