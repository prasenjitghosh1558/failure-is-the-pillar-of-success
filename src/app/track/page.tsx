"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Search, Package, ArrowRight, ShieldCheck, Clock, MapPin, Truck, Plus } from "lucide-react";

export default function TrackSearchPage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/shipments?limit=10")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.shipments) {
          setShipments(data.shipments);
        }
      })
      .catch(() => setShipments([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      router.push(`/track/${encodeURIComponent(trackingNumber.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="text-center space-y-4 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-panel border border-cyan/40 text-xs font-mono text-cyan">
            <Package className="w-3.5 h-3.5" />
            <span>NEXTRAK PharmaOS • National Life-Sciences Gateway</span>
          </div>
          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold text-text-primary">
            Track Vaccine Consignment, CDSCO E-Way Bill or Batch
          </h1>
          <p className="text-text-secondary text-sm max-w-xl mx-auto">
            Live cold-chain telemetry (-80°C to +25°C), WDFC reefer rake tracking, and verified hospital depot inward receipts.
          </p>
        </div>

        {/* Big Search Input Form */}
        <div className="glass-panel-glow p-3 rounded-2xl border border-cyan/40 shadow-glow mb-12">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center gap-3 w-full px-4 py-3">
              <Search className="w-5 h-5 text-cyan shrink-0" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter Consignment or Tracking Number (e.g. VAX-2026-101)"
                className="w-full bg-transparent border-none text-text-primary font-mono text-base focus:outline-none placeholder:text-text-muted"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-sm hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2 shrink-0"
            >
              <span>Track Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Active Real Consignments */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-sm font-semibold uppercase tracking-wider text-text-secondary">
              Active Consignments in System ({shipments.length})
            </h3>
            <span className="text-xs text-text-muted font-mono">Real-Time Telemetry</span>
          </div>

          {loading ? (
            <div className="glass-panel p-8 rounded-xl border border-border-subtle text-center text-xs text-text-muted">
              Loading active consignments...
            </div>
          ) : shipments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shipments.map((ship) => (
                <div
                  key={ship.id}
                  onClick={() => router.push(`/track/${ship.trackingNumber}`)}
                  className="glass-panel p-4 rounded-xl border border-border-subtle hover:border-cyan/40 transition cursor-pointer flex items-center justify-between group"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-text-primary group-hover:text-cyan transition truncate">
                        {ship.trackingNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-navy-850 text-text-secondary font-mono border border-border-subtle shrink-0">
                        {ship.carrier}
                      </span>
                    </div>
                    <div className="text-xs text-text-secondary flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-cyan shrink-0" />
                      <span>{ship.originCity} → {ship.destinationCity}</span>
                    </div>
                    <div className="text-[11px] text-text-muted truncate">
                      {ship.packageDescription || ship.serviceType}
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end gap-2 shrink-0 ml-3">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-cyan/15 text-cyan border border-cyan/30">
                      {ship.currentStatus}
                    </span>
                    <div className="text-cyan text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Inspect 3D</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-xl border border-border-subtle text-center space-y-3">
              <Package className="w-8 h-8 text-cyan mx-auto opacity-70" />
              <p className="text-xs text-text-secondary">
                No active shipments in the database yet. Create your first manifest in the dispatch dashboard.
              </p>
              <Link
                href="/dashboard/shipments"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan text-navy-950 font-bold text-xs hover:bg-cyan/90 transition shadow-glow"
              >
                <Plus className="w-4 h-4" />
                <span>+ Create Manifest</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
