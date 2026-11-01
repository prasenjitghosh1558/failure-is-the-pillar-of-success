"use client";

import React, { useState } from "react";
import {
  X,
  MapPin,
  Truck,
  Thermometer,
  Activity,
  CheckCircle2,
  ArrowRight,
  Gauge,
  Sliders,
} from "lucide-react";

interface AddCheckpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipment: any;
  onSuccess: (updatedShipment: any) => void;
}

export function AddCheckpointModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
}: AddCheckpointModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [status, setStatus] = useState(shipment?.currentStatus || "IN_TRANSIT");
  const [locationName, setLocationName] = useState(
    shipment?.destinationCity ? `${shipment.destinationCity} Transit Point` : "Nagpur MIHAN Bypass"
  );
  const [milestoneTitle, setMilestoneTitle] = useState("Corridor Checkpoint & Telemetry Verified");
  const [notes, setNotes] = useState(
    "Cold-chain sensor telemetry within tolerance. Moving along primary dedicated freight corridor."
  );
  const [temperature, setTemperature] = useState("-20.4°C");
  const [progress, setProgress] = useState(55);

  if (!isOpen || !shipment) return null;

  const intermediateCitySuggestions = [
    "Nagpur MIHAN Bypass",
    "Bhopal Transshipment Hub",
    "Surat NH-48 Checkpost",
    "Rewari WDFC Junction",
    "Talegaon Reefer Siding",
    "Adilabad NH-44 Toll Plaza",
    "Vijayawada Gateway",
    "Gwalior Express Bypass",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/shipments/${shipment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          eventTitle: milestoneTitle,
          eventDescription: notes,
          eventLocation: locationName,
          progress: Number(progress),
          temperature,
        }),
      });

      const data = await res.json();
      if (res.ok && data.shipment) {
        onSuccess(data.shipment);
        onClose();
      } else {
        setError(data.error || "Failed to commit checkpoint.");
      }
    } catch {
      setError("Communication error recording checkpoint.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#0F172A] border border-cyan/40 rounded-2xl shadow-2xl overflow-hidden transition-all duration-200">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
                <span>Add Checkpoint / Advance Truck</span>
                <span className="font-mono text-xs text-cyan">[{shipment.trackingNumber}]</span>
              </h3>
              <p className="text-xs text-text-secondary">
                {shipment.originCity} → {shipment.destinationCity}
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
          <div className="mx-5 mt-4 p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-status-error text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {/* Status Selection */}
          <div>
            <label className="text-text-secondary block mb-1 font-medium">
              Shipment Operational Status *
            </label>
            <select
              value={status}
              onChange={(e) => {
                const newS = e.target.value;
                setStatus(newS);
                if (newS === "DELIVERED") setProgress(100);
                if (newS === "OUT_FOR_DELIVERY") setProgress(88);
                if (newS === "PICKED_UP") setProgress(15);
              }}
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary font-medium focus:outline-none"
            >
              <option value="PICKED_UP">PICKED_UP (Origin Depot Cleared)</option>
              <option value="IN_TRANSIT">IN_TRANSIT (Corridor Express Movement)</option>
              <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Last-Mile Hospital Transit)</option>
              <option value="DELIVERED">DELIVERED (Signed & Transferred to Cold Room)</option>
              <option value="DELAYED">DELAYED (Weather / Operational Hold)</option>
            </select>
          </div>

          {/* Route Progress Slider (0% to 100%) */}
          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-border-subtle space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-text-primary flex items-center gap-1.5 text-xs">
                <Sliders className="w-3.5 h-3.5 text-cyan" />
                <span>Move Truck Progress Slider</span>
              </span>
              <span className="font-mono text-cyan font-bold text-xs">
                {progress}% along corridor
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-[#00D4FF] cursor-pointer"
            />

            <div className="flex items-center justify-between text-[10px] text-text-muted font-mono">
              <span>{shipment.originCity} (0%)</span>
              <span>Mid-Corridor (50%)</span>
              <span>{shipment.destinationCity} (100%)</span>
            </div>
          </div>

          {/* Location Name & Suggestions */}
          <div>
            <label className="text-text-secondary block mb-1 font-medium">
              Checkpoint Location Name *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. Nagpur MIHAN Life Sciences Bypass"
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-text-primary focus:outline-none"
            />

            {/* Quick Suggestions Chips */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {intermediateCitySuggestions.slice(0, 4).map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => setLocationName(city)}
                  className="px-2 py-0.5 rounded-md bg-navy-850 hover:bg-navy-800 border border-border-subtle text-[10px] text-text-secondary hover:text-cyan transition"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Milestone Title & Temperature */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-text-secondary block mb-1 font-medium">Milestone Title</label>
              <input
                type="text"
                value={milestoneTitle}
                onChange={(e) => setMilestoneTitle(e.target.value)}
                placeholder="e.g. In Transit Continuous Telemetry"
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-text-secondary block mb-1 font-medium">Current Temperature</label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g. -20.4°C"
                className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-cyan font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-text-secondary block mb-1 font-medium">Event Description & Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Reefer compressor active, speed 68 km/h, seal intact."
              className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2 border-t border-border-subtle flex items-center justify-end gap-3">
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
              className="px-5 py-2.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center gap-1.5"
            >
              <span>{loading ? "Recording Checkpoint..." : "Commit Checkpoint & Move Truck"}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

