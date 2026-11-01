"use client";

import React, { useState } from "react";
import {
  X,
  Package,
  Truck,
  MapPin,
  Thermometer,
  Shield,
  RotateCcw,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { LOGISTICS_NODES } from "@/lib/maps/india-cartography-data";

interface NewShipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (shipment: any) => void;
}

export function NewShipmentModal({
  isOpen,
  onClose,
  onSuccess,
}: NewShipmentModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default to first hub (Delhi NCR) and fourth hub (Hyderabad Genome Valley)
  const [originNodeId, setOriginNodeId] = useState("delhi-dadri");
  const [destNodeId, setDestNodeId] = useState("hyderabad-genome");

  // Form Fields
  const [trackingNumber, setTrackingNumber] = useState(
    `VAX-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`
  );
  const [cargoTitle, setCargoTitle] = useState("Cryogenic mRNA Vaccines (-20°C)");
  const [carrier, setCarrier] = useState("NEXTRAK Pharma Road Reefer");
  const [serviceType, setServiceType] = useState("Cryogenic Reefer Express (-20°C)");
  const [senderName, setSenderName] = useState("AIIMS National Medical Cold Vault");
  const [recipientName, setRecipientName] = useState("Genome Valley Regional Distribution Center");
  const [weightKg, setWeightKg] = useState("1250");
  const [batchNumber, setBatchNumber] = useState(`BATCH-CDSCO-${Math.floor(1000 + Math.random() * 9000)}`);
  const [targetTemp, setTargetTemp] = useState("-20.0°C");
  const [currentSensorTemp, setCurrentSensorTemp] = useState("-20.4°C");
  const [initialStatus, setInitialStatus] = useState("IN_TRANSIT");

  if (!isOpen) return null;

  const handleGenerateTracking = () => {
    const prefixes = ["VAX", "INS", "ONC", "PLS", "BIO"];
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    setTrackingNumber(`${p}-${num}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const originNode = LOGISTICS_NODES.find((n) => n.id === originNodeId) || LOGISTICS_NODES[0];
    const destNode = LOGISTICS_NODES.find((n) => n.id === destNodeId) || LOGISTICS_NODES[1];

    try {
      const res = await fetch("/api/shipments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingNumber,
          packageDescription: cargoTitle,
          carrier,
          serviceType,
          senderName,
          senderCity: originNode.city.name,
          senderAddress: `${originNode.clusterName}`,
          recipientName,
          recipientCity: destNode.city.name,
          recipientAddress: `${destNode.clusterName}`,
          originLat: originNode.coordinates[1],
          originLng: originNode.coordinates[0],
          destinationLat: destNode.coordinates[1],
          destinationLng: destNode.coordinates[0],
          weightKg: parseFloat(weightKg) || 1250,
          currentStatus: initialStatus,
          dimensions: "40x30x25 cm",
          packageType: "Cryo Pallet",
          specialInstructions: `Target Temp: ${targetTemp} | Sensor: ${currentSensorTemp} | Batch: ${batchNumber}`,
          initialMilestoneTitle: "Consignment Manifest Sealed & GDP Inspected",
          initialMilestoneLocation: originNode.city.name,
        }),
      });

      const data = await res.json();
      if (res.ok && data.shipment) {
        onSuccess(data.shipment);
        onClose();
      } else {
        setError(data.error || "Failed to create shipment manifest.");
      }
    } catch {
      setError("Network error creating consignment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0F172A] border border-cyan/40 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
        {/* Header */}
        <div className="p-5 pb-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-text-primary">
                New Medical Consignment Manifest
              </h2>
              <p className="text-xs text-text-secondary">
                Generate an authenticated cold-chain shipment across the 23 national healthcare nodes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-850 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-status-error text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[520px] overflow-y-auto space-y-4 text-xs">
          {/* Tracking ID & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary block mb-1 font-medium">
                Tracking Number *
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. VAX-2026-101"
                  className="flex-1 px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary font-mono text-xs focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGenerateTracking}
                  className="px-2.5 py-2 rounded-xl bg-navy-850 border border-border-subtle hover:border-cyan text-[11px] text-cyan font-mono transition"
                  title="Generate Random ID"
                >
                  Generate
                </button>
              </div>
            </div>

            <div>
              <label className="text-text-secondary block mb-1 font-medium">
                Medicine / Cargo Title *
              </label>
              <input
                type="text"
                required
                value={cargoTitle}
                onChange={(e) => setCargoTitle(e.target.value)}
                placeholder="e.g. Cryogenic mRNA Vaccines (-20°C)"
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Carrier & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary block mb-1 font-medium">
                Corridor Service / Carrier *
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary text-xs focus:outline-none"
              >
                <option value="WDFC Reefer Rake Express">WDFC Reefer Rake Express (Rail)</option>
                <option value="NEXTRAK Pharma Road Reefer">NEXTRAK Pharma Road Reefer (Highway)</option>
                <option value="Air India Cargo Medical Lifeline">Air India Cargo Medical Lifeline (Air)</option>
                <option value="NH-44 Critical Care Fleet">NH-44 Critical Care Fleet (Express)</option>
              </select>
            </div>

            <div>
              <label className="text-text-secondary block mb-1 font-medium">
                Initial Operational Status *
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary text-xs focus:outline-none font-medium"
              >
                <option value="CREATED">CREATED (Manifest Initialized)</option>
                <option value="PICKED_UP">PICKED_UP (Cold Box Sealed)</option>
                <option value="IN_TRANSIT">IN_TRANSIT (Active Corridor Transit)</option>
                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Last-Mile Hospital Depot)</option>
                <option value="DELIVERED">DELIVERED (Signed & Logged)</option>
              </select>
            </div>
          </div>

          {/* Origin & Destination Hubs (Mapped from 23 Indian Nodes) */}
          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-border-subtle space-y-3">
            <span className="font-heading font-semibold text-text-primary uppercase tracking-wider text-[10px] text-cyan block">
              Indian Healthcare Corridor Routing (23 Nodes)
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-text-secondary block mb-1">Origin Logistics Hub *</label>
                <select
                  value={originNodeId}
                  onChange={(e) => setOriginNodeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary text-xs focus:outline-none"
                >
                  {LOGISTICS_NODES.map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.city.code}] {n.city.name} ({n.tier.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Destination Logistics Hub *</label>
                <select
                  value={destNodeId}
                  onChange={(e) => setDestNodeId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary text-xs focus:outline-none"
                >
                  {LOGISTICS_NODES.map((n) => (
                    <option key={n.id} value={n.id}>
                      [{n.city.code}] {n.city.name} ({n.tier.replace(/_/g, " ")})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-text-muted block text-[11px] mb-1">Origin Facility / Shipper</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Serum Institute / Bharat Biotech"
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary text-xs"
                />
              </div>

              <div>
                <label className="text-text-muted block text-[11px] mb-1">Destination Recipient / Facility</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. AIIMS Delhi / Apollo Hospital"
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary text-xs"
                />
              </div>
            </div>
          </div>

          {/* Cold-Chain Specs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            <div>
              <label className="text-text-muted block text-[10px] mb-1">Target Temp</label>
              <input
                type="text"
                value={targetTemp}
                onChange={(e) => setTargetTemp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-border-subtle text-text-primary font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-text-muted block text-[10px] mb-1">Live Sensor</label>
              <input
                type="text"
                value={currentSensorTemp}
                onChange={(e) => setCurrentSensorTemp(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-border-subtle text-cyan font-mono text-xs font-bold"
              />
            </div>
            <div>
              <label className="text-text-muted block text-[10px] mb-1">Weight (KG)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-border-subtle text-text-primary text-xs"
              />
            </div>
            <div>
              <label className="text-text-muted block text-[10px] mb-1">Batch Number</label>
              <input
                type="text"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-navy-900 border border-border-subtle text-text-primary font-mono text-xs"
              />
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-navy-900 text-text-secondary hover:text-text-primary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center gap-2"
            >
              <span>{loading ? "Generating Manifest..." : "Register & Launch Shipment"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

