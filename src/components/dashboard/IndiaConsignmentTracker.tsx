"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Package,
  Truck,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  Thermometer,
  Sliders,
} from "lucide-react";
import { ShipmentIsometricRouteVisualizer } from "@/components/map/ShipmentIsometricRouteVisualizer";
import { NewShipmentModal } from "@/components/dashboard/NewShipmentModal";
import { AddCheckpointModal } from "@/components/dashboard/AddCheckpointModal";
import { formatDateTime, formatDateOnly } from "@/lib/utils";

export type MockConsignment = any;

interface IndiaConsignmentTrackerProps {
  onSelectConsignment?: (consignment: any) => void;
}

export function IndiaConsignmentTracker({
  onSelectConsignment,
}: IndiaConsignmentTrackerProps) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  // Modals State
  const [isNewShipmentOpen, setIsNewShipmentOpen] = useState(false);
  const [isAddCheckpointOpen, setIsAddCheckpointOpen] = useState(false);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shipments?limit=25");
      if (res.ok) {
        const data = await res.json();
        const list = data.shipments || [];
        setShipments(list);
        if (list.length > 0 && !selectedShipment) {
          setSelectedShipment(list[0]);
          if (onSelectConsignment) onSelectConsignment(list[0]);
        }
      }
    } catch (e) {
      console.error("Fetch shipments error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = query.trim().toUpperCase();
    if (!cleaned) return;

    const match = shipments.find(
      (s) =>
        s.trackingNumber.toUpperCase().includes(cleaned) ||
        s.destinationCity.toUpperCase().includes(cleaned) ||
        s.originCity.toUpperCase().includes(cleaned)
    );

    if (match) {
      setSelectedShipment(match);
      if (onSelectConsignment) onSelectConsignment(match);
    }
  };

  const handleDeleteShipment = async (id: string, trackingNumber: string) => {
    if (!confirm(`Cancel and remove shipment manifest ${trackingNumber}?`)) return;

    try {
      const res = await fetch(`/api/shipments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShipments((prev) => prev.filter((s) => s.id !== id));
        if (selectedShipment?.id === id) {
          const remaining = shipments.filter((s) => s.id !== id);
          setSelectedShipment(remaining.length > 0 ? remaining[0] : null);
        }
      }
    } catch {
      alert("Failed to delete shipment.");
    }
  };

  return (
    <div className="w-full space-y-5">
      {/* Search & Actions Bar */}
      <div className="glass-panel-glow p-4 rounded-2xl border border-cyan/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <form onSubmit={handleSearch} className="flex-1 flex items-center gap-3 w-full px-3 py-1.5 bg-navy-900 rounded-xl border border-border-subtle focus-within:border-cyan">
            <Search className="w-5 h-5 text-cyan shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by Tracking ID, Medicine Name, or Destination City..."
              className="w-full bg-transparent border-none text-text-primary font-mono text-xs sm:text-sm focus:outline-none placeholder:text-text-muted"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-text-muted hover:text-text-primary text-xs"
              >
                Clear
              </button>
            )}
          </form>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleSearch}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-1.5"
            >
              <span>Track</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsNewShipmentOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-navy-850 hover:bg-navy-800 border border-cyan/40 text-cyan text-xs font-heading font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Manifest</span>
            </button>
          </div>
        </div>

        {/* Real Shipments Pill Filter */}
        {shipments.length > 0 && (
          <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center gap-2 text-xs">
            <span className="text-text-muted text-[11px] font-medium mr-1">Active Manifests:</span>
            {shipments.slice(0, 6).map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedShipment(s);
                  if (onSelectConsignment) onSelectConsignment(s);
                }}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition flex items-center gap-1.5 border ${
                  selectedShipment?.id === s.id
                    ? "bg-cyan/20 text-cyan border-cyan/50 shadow-sm"
                    : "bg-navy-900/60 text-text-secondary hover:text-text-primary border-border-subtle hover:border-cyan/30"
                }`}
              >
                <span className="font-semibold">{s.trackingNumber}</span>
                <span className="text-[10px] text-text-muted">({s.currentStatus})</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Shipment Dashboard */}
      {selectedShipment ? (
        <div className="space-y-4">
          {/* 1. EMBEDDED 3D ISOMETRIC GLOWING ORANGE ROUTE & TRUCK VISUALIZER */}
          <ShipmentIsometricRouteVisualizer
            trackingNumber={selectedShipment.trackingNumber}
            carrier={selectedShipment.carrier}
            serviceType={selectedShipment.serviceType}
            status={selectedShipment.currentStatus}
            originCity={selectedShipment.originCity}
            originLat={selectedShipment.originLat}
            originLng={selectedShipment.originLng}
            destinationCity={selectedShipment.destinationCity}
            destinationLat={selectedShipment.destinationLat}
            destinationLng={selectedShipment.destinationLng}
            currentLat={selectedShipment.currentLat}
            currentLng={selectedShipment.currentLng}
            temperature="-20.4°C"
            weightKg={selectedShipment.weightKg}
            className="h-[460px] sm:h-[520px]"
          />

          {/* 2. Shipment Summary & Action Controls */}
          <div className="glass-panel p-5 rounded-2xl border border-border-subtle space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-lg font-extrabold text-cyan">
                    {selectedShipment.trackingNumber}
                  </span>
                  <span className="text-[10px] px-2.5 py-0.5 rounded-full font-medium bg-status-success/15 text-status-success border border-status-success/30 font-mono">
                    {selectedShipment.currentStatus}
                  </span>
                  <span className="text-xs text-text-muted">
                    {selectedShipment.serviceType}
                  </span>
                </div>
                <h3 className="font-heading text-sm font-semibold text-text-primary mt-1">
                  {selectedShipment.packageDescription || "Cryogenic Medical Cargo"}
                </h3>
                <p className="text-xs text-text-secondary mt-0.5">
                  Carrier: {selectedShipment.carrier} • Weight: {selectedShipment.weightKg} kg
                </p>
              </div>

              {/* Action Buttons: Add Checkpoint + Delete */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsAddCheckpointOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-heading font-bold flex items-center gap-1.5 transition shadow-sm"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>+ Add Checkpoint / Move Truck</span>
                </button>

                <button
                  onClick={() => handleDeleteShipment(selectedShipment.id, selectedShipment.trackingNumber)}
                  className="p-2 rounded-xl border border-border-subtle hover:border-status-error/40 hover:bg-status-error/10 text-text-muted hover:text-status-error transition"
                  title="Delete Shipment"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Origin -> Destination Corridor Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-navy-900/60 border border-border-subtle flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-[#FF8800]/20 text-[#FF8800] border border-[#FF8800]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-[#FF8800] font-mono uppercase block font-bold">
                    ORIGIN DISPATCH FACILITY
                  </span>
                  <span className="font-heading font-semibold text-sm text-text-primary">
                    {selectedShipment.originCity}
                  </span>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {selectedShipment.senderName} ({selectedShipment.senderAddress})
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-navy-900/60 border border-border-subtle flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-status-success/20 text-status-success border border-status-success/40 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-status-success font-mono uppercase block font-bold">
                    DESTINATION RECEIVING FACILITY
                  </span>
                  <span className="font-heading font-semibold text-sm text-text-primary">
                    {selectedShipment.destinationCity}
                  </span>
                  <p className="text-xs text-text-secondary mt-0.5">
                    {selectedShipment.recipientName} ({selectedShipment.recipientAddress})
                  </p>
                </div>
              </div>
            </div>

            {/* Checkpoint Milestones List */}
            {selectedShipment.events && selectedShipment.events.length > 0 && (
              <div className="pt-2 border-t border-border-subtle space-y-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Logged Milestones & Checkpoints ({selectedShipment.events.length})
                </span>

                <div className="space-y-2">
                  {selectedShipment.events.map((ev: any, idx: number) => (
                    <div
                      key={ev.id || idx}
                      className="p-3 rounded-xl bg-navy-900/50 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-cyan shrink-0 mt-0.5" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-text-primary">
                              {ev.title}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
                              {ev.status}
                            </span>
                          </div>
                          <p className="text-xs text-text-secondary mt-0.5">
                            {ev.description}
                          </p>
                          <span className="text-[10px] text-text-muted flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-cyan" />
                            <span>{ev.location}</span>
                          </span>
                        </div>
                      </div>

                      <div className="text-left sm:text-right text-[10px] font-mono text-text-muted shrink-0">
                        {formatDateTime(ev.eventTimestamp || ev.createdAt)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-10 rounded-2xl border border-cyan/30 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan/15 border border-cyan/40 text-cyan flex items-center justify-center mx-auto shadow-glow">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-heading text-lg font-bold text-text-primary">
              No Consignment Manifests in Database
            </h3>
            <p className="text-xs text-text-secondary max-w-md mx-auto mt-1">
              All pre-seeded demo records have been cleaned. Create your first medical shipment manifest to activate live 3D isometric tracking.
            </p>
          </div>

          <button
            onClick={() => setIsNewShipmentOpen(true)}
            className="px-6 py-3 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>+ Create New Shipment Manifest</span>
          </button>
        </div>
      )}

      {/* New Shipment Modal */}
      <NewShipmentModal
        isOpen={isNewShipmentOpen}
        onClose={() => setIsNewShipmentOpen(false)}
        onSuccess={(newShipment) => {
          setShipments((prev) => [newShipment, ...prev]);
          setSelectedShipment(newShipment);
          if (onSelectConsignment) onSelectConsignment(newShipment);
        }}
      />

      {/* Add Checkpoint / Move Truck Modal */}
      {selectedShipment && (
        <AddCheckpointModal
          isOpen={isAddCheckpointOpen}
          onClose={() => setIsAddCheckpointOpen(false)}
          shipment={selectedShipment}
          onSuccess={(updated) => {
            setSelectedShipment(updated);
            setShipments((prev) =>
              prev.map((s) => (s.id === updated.id ? updated : s))
            );
            if (onSelectConsignment) onSelectConsignment(updated);
          }}
        />
      )}
    </div>
  );
}
