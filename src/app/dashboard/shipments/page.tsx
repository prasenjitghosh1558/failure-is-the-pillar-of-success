"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  ExternalLink,
  Edit2,
  Trash2,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  X,
  Truck,
  Eye,
  Sliders,
  Compass,
  Sparkles,
} from "lucide-react";
import { formatDateTime, formatDateOnly, getStatusBadgeInfo } from "@/lib/utils";
import { NewShipmentModal } from "@/components/dashboard/NewShipmentModal";
import { AddCheckpointModal } from "@/components/dashboard/AddCheckpointModal";
import { ShipmentIsometricRouteVisualizer } from "@/components/map/ShipmentIsometricRouteVisualizer";

export default function ShipmentsManagementPage() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [carrierFilter, setCarrierFilter] = useState("ALL");

  // Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<any | null>(null);

  // 3D Inspection Modal State
  const [inspectShipment, setInspectShipment] = useState<any | null>(null);

  const fetchShipments = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (statusFilter !== "ALL") query.set("status", statusFilter);
      if (carrierFilter !== "ALL") query.set("carrier", carrierFilter);

      const res = await fetch(`/api/shipments?${query.toString()}`);
      if (res.ok) {
        const shipData = await res.json();
        setShipments(shipData.shipments || []);
      }
    } catch (e) {
      console.error("Fetch shipments error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, [statusFilter, carrierFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchShipments();
  };

  const handleDeleteShipment = async (id: string, trackingNumber: string) => {
    if (!confirm(`Are you sure you want to cancel and remove shipment ${trackingNumber}?`))
      return;
    try {
      const res = await fetch(`/api/shipments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchShipments();
        if (inspectShipment?.id === id) setInspectShipment(null);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete shipment");
      }
    } catch {
      alert("Failed to delete shipment");
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Package className="w-6 h-6 text-cyan" />
            <span>Shipment Management & Manifests</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Create user-directed cold-chain consignments, log real-time checkpoints, and inspect 3D routes.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ New Shipment Manifest</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-4 rounded-xl border border-border-subtle flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tracking, recipient, city..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-xs text-text-primary focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-cyan"
          >
            <option value="ALL">All Statuses</option>
            <option value="CREATED">Created</option>
            <option value="PICKED_UP">Picked Up</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="DELAYED">Delayed</option>
          </select>

          {/* Carrier Filter */}
          <select
            value={carrierFilter}
            onChange={(e) => setCarrierFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-xs text-text-primary focus:outline-none focus:border-cyan"
          >
            <option value="ALL">All Carriers</option>
            <option value="WDFC Reefer Rake Express">WDFC Reefer Rake Express</option>
            <option value="NEXTRAK Pharma Road Reefer">NEXTRAK Pharma Road Reefer</option>
            <option value="Air India Cargo Medical Lifeline">Air India Cargo Medical Lifeline</option>
            <option value="NH-44 Critical Care Fleet">NH-44 Critical Care Fleet</option>
          </select>

          <button
            onClick={fetchShipments}
            className="p-2 rounded-xl bg-navy-900 border border-border-subtle text-text-secondary hover:text-cyan transition"
            title="Refresh Table"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Shipments Table Card */}
      <div className="glass-panel rounded-2xl border border-border-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-navy-900/80 text-text-muted font-heading uppercase text-[10px] tracking-wider border-b border-border-subtle">
              <tr>
                <th className="px-5 py-3.5">Tracking Identification</th>
                <th className="px-5 py-3.5">Route Corridor</th>
                <th className="px-5 py-3.5">Carrier Service</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Weight / Cargo</th>
                <th className="px-5 py-3.5">Est. Delivery</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-text-muted">
                    Loading consignment records...
                  </td>
                </tr>
              ) : shipments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-cyan/15 border border-cyan/30 text-cyan flex items-center justify-center mx-auto">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="font-heading font-bold text-sm text-text-primary">
                      No Consignments in Database
                    </div>
                    <p className="text-xs text-text-secondary max-w-sm mx-auto">
                      All demo data has been cleaned. Create your first shipment manifest to begin live 3D tracking.
                    </p>
                    <button
                      onClick={() => setIsCreateOpen(true)}
                      className="px-4 py-2 rounded-xl bg-cyan text-navy-950 font-bold hover:bg-cyan/90 transition shadow-glow text-xs inline-flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Create Manifest</span>
                    </button>
                  </td>
                </tr>
              ) : (
                shipments.map((s) => {
                  const badge = getStatusBadgeInfo(s.currentStatus);
                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-navy-900/40 transition group cursor-pointer"
                      onClick={() => setInspectShipment(s)}
                    >
                      <td className="px-5 py-3.5 font-mono font-bold text-text-primary">
                        <div className="flex items-center gap-1.5 group-hover:text-cyan transition">
                          <span>{s.trackingNumber}</span>
                          <Eye className="w-3.5 h-3.5 text-cyan opacity-0 group-hover:opacity-100 transition" />
                        </div>
                        <span className="text-[10px] text-text-muted font-normal block truncate max-w-[140px]">
                          To: {s.recipientName}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-text-secondary">
                        <div className="flex items-center gap-1 font-medium text-text-primary">
                          <span>{s.originCity}</span>
                          <span className="text-cyan">→</span>
                          <span>{s.destinationCity}</span>
                        </div>
                        <span className="text-[10px] text-text-muted block truncate max-w-[150px]">
                          {s.senderName}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span className="font-semibold text-text-primary block truncate max-w-[160px]">
                          {s.carrier}
                        </span>
                        <span className="text-[10px] text-text-muted block truncate max-w-[160px]">
                          {s.serviceType}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${badge.color}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3.5 font-mono text-text-secondary">
                        <div>{s.weightKg} kg</div>
                        <span className="text-[10px] text-text-muted font-sans block truncate max-w-[120px]">
                          {s.packageDescription || s.packageType}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 text-text-secondary">
                        {formatDateOnly(s.estimatedDelivery)}
                      </td>

                      <td
                        className="px-5 py-3.5 text-right space-x-1.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* 3D Inspect Button */}
                        <button
                          onClick={() => setInspectShipment(s)}
                          className="p-1.5 rounded-lg bg-navy-900 border border-border-subtle hover:border-cyan text-text-secondary hover:text-cyan transition"
                          title="Inspect 3D Glowing Route & Truck"
                        >
                          <Compass className="w-3.5 h-3.5 text-amber-400" />
                        </button>

                        {/* Add Checkpoint Button */}
                        <button
                          onClick={() => {
                            setSelectedShipment(s);
                            setIsUpdateOpen(true);
                          }}
                          className="p-1.5 rounded-lg bg-navy-900 border border-border-subtle hover:border-cyan text-text-secondary hover:text-cyan transition"
                          title="Add Checkpoint / Advance Truck Progress"
                        >
                          <Sliders className="w-3.5 h-3.5 text-cyan" />
                        </button>

                        {/* Public Tracker Link */}
                        <Link
                          href={`/track/${s.trackingNumber}`}
                          className="p-1.5 rounded-lg bg-navy-900 border border-border-subtle hover:border-cyan text-text-secondary hover:text-cyan transition inline-flex"
                          title="Open Public Tracking View"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteShipment(s.id, s.trackingNumber)}
                          className="p-1.5 rounded-lg bg-navy-900 border border-border-subtle hover:border-status-error/40 text-text-muted hover:text-status-error transition"
                          title="Delete Shipment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3D Isometric Inspection Modal (Embedded Visualizer) */}
      {inspectShipment && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in">
          <div className="glass-panel p-5 rounded-2xl border border-cyan/40 max-w-4xl w-full max-h-[92vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/15 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Compass className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
                    <span>3D Isometric Route & Truck Telematics</span>
                    <span className="font-mono text-cyan text-sm">[{inspectShipment.trackingNumber}]</span>
                  </h3>
                  <p className="text-xs text-text-secondary">
                    {inspectShipment.originCity} → {inspectShipment.destinationCity} • {inspectShipment.carrier}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedShipment(inspectShipment);
                    setIsUpdateOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-semibold flex items-center gap-1.5"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advance Progress</span>
                </button>
                <button
                  onClick={() => setInspectShipment(null)}
                  className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-850"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded 3D Isometric Visualizer */}
            <ShipmentIsometricRouteVisualizer
              trackingNumber={inspectShipment.trackingNumber}
              carrier={inspectShipment.carrier}
              serviceType={inspectShipment.serviceType}
              status={inspectShipment.currentStatus}
              originCity={inspectShipment.originCity}
              originLat={inspectShipment.originLat}
              originLng={inspectShipment.originLng}
              destinationCity={inspectShipment.destinationCity}
              destinationLat={inspectShipment.destinationLat}
              destinationLng={inspectShipment.destinationLng}
              currentLat={inspectShipment.currentLat}
              currentLng={inspectShipment.currentLng}
              temperature="-20.4°C"
              weightKg={inspectShipment.weightKg}
              className="h-[440px] sm:h-[480px]"
            />

            {/* Checkpoint Milestones in Modal */}
            {inspectShipment.events && inspectShipment.events.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted block">
                  Logged Milestones ({inspectShipment.events.length})
                </span>
                <div className="space-y-1.5 max-h-36 overflow-y-auto">
                  {inspectShipment.events.map((ev: any, i: number) => (
                    <div
                      key={ev.id || i}
                      className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan shrink-0" />
                        <span className="font-medium text-text-primary">{ev.title}</span>
                        <span className="text-[10px] text-text-muted">({ev.location})</span>
                      </div>
                      <span className="text-[10px] font-mono text-cyan">{ev.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Shipment Manifest Modal */}
      <NewShipmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => fetchShipments()}
      />

      {/* Add Checkpoint / Move Truck Modal */}
      {selectedShipment && (
        <AddCheckpointModal
          isOpen={isUpdateOpen}
          onClose={() => setIsUpdateOpen(false)}
          shipment={selectedShipment}
          onSuccess={() => {
            fetchShipments();
            if (inspectShipment?.id === selectedShipment.id) {
              fetch(`/api/shipments/${selectedShipment.id}`)
                .then((r) => r.json())
                .then((d) => d.shipment && setInspectShipment(d.shipment));
            }
          }}
        />
      )}
    </div>
  );
}
