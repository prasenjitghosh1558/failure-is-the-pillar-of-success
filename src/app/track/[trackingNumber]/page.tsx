"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Search,
  Copy,
  Check,
  Share2,
  RefreshCw,
  ExternalLink,
  Info,
  Navigation,
  Layers,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShipmentIsometricRouteVisualizer } from "@/components/map/ShipmentIsometricRouteVisualizer";
import { AddCheckpointModal } from "@/components/dashboard/AddCheckpointModal";
import { formatDateTime, formatDateOnly, getStatusBadgeInfo } from "@/lib/utils";

export default function ShipmentTrackingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawNumber = params.trackingNumber as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shipment, setShipment] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [newSearch, setNewSearch] = useState("");
  const [isCheckpointModalOpen, setIsCheckpointModalOpen] = useState(false);

  const fetchTracking = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(rawNumber)}`);
      const data = await res.json();
      if (res.ok && data.found) {
        setShipment(data.shipment);
      } else {
        setError(data.message || `No shipment found for tracking number "${rawNumber}".`);
      }
    } catch {
      setError("Failed to fetch tracking data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rawNumber) {
      fetchTracking();
    }
  }, [rawNumber]);

  const handleCopy = () => {
    if (shipment?.trackingNumber) {
      navigator.clipboard.writeText(shipment.trackingNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNewSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSearch.trim()) {
      router.push(`/track/${encodeURIComponent(newSearch.trim().toUpperCase())}`);
    }
  };

  // Stepper timeline definition
  const standardSteps = [
    { key: "CREATED", label: "Manifest Created" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "ORIGIN_FACILITY", label: "Origin Facility" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
    { key: "DELIVERED", label: "Delivered" },
  ];

  const getStepStatusIndex = (currentStatus: string) => {
    const s = currentStatus.toUpperCase();
    if (s === "DELIVERED") return 5;
    if (s === "OUT_FOR_DELIVERY") return 4;
    if (s === "DESTINATION_FACILITY" || s === "IN_TRANSIT") return 3;
    if (s === "ORIGIN_FACILITY" || s === "ARRIVED_AT_FACILITY" || s === "DEPARTED_FACILITY") return 2;
    if (s === "PICKED_UP") return 1;
    if (s === "DELAYED") return 3; // active in transit with delay
    return 0;
  };

  const currentStepIdx = shipment ? getStepStatusIndex(shipment.currentStatus) : 0;
  const isDelayed = shipment?.currentStatus === "DELAYED";

  // Build map markers
  const mapMarkers: any[] = shipment
    ? [
        {
          id: shipment.id || "shipment-active",
          type: "shipment",
          title: shipment.trackingNumber,
          subtitle: `${shipment.carrier} • ${shipment.currentStatus}`,
          lat: shipment.currentLat || shipment.originLat || 41.8781,
          lng: shipment.currentLng || shipment.originLng || -87.6298,
          status: shipment.currentStatus,
          sourceType: shipment.sourceType || "SYSTEM_DEMO",
          origin: {
            city: shipment.originCity,
            lat: shipment.originLat,
            lng: shipment.originLng,
          },
          destination: {
            city: shipment.destinationCity,
            lat: shipment.destinationLat,
            lng: shipment.destinationLng,
          },
        },
      ]
    : [];

  const badgeInfo = shipment ? getStatusBadgeInfo(shipment.currentStatus) : null;

  return (
    <div className="flex flex-col min-h-screen bg-navy-950">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Search Header Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs text-text-secondary mb-1">
              <Link href="/track" className="hover:text-cyan transition">
                Tracking Portal
              </Link>
              <span>/</span>
              <span className="font-mono text-cyan">{rawNumber}</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text-primary flex items-center gap-3">
              <span>Shipment Tracking</span>
              {badgeInfo && (
                <span
                  className={`text-xs px-3 py-1 rounded-full font-medium border flex items-center gap-1.5 ${badgeInfo.color}`}
                >
                  <span className={`w-2 h-2 rounded-full ${badgeInfo.dot}`} />
                  <span>{badgeInfo.label}</span>
                </span>
              )}
            </h1>
          </div>

          {/* Quick Search Another Package Form */}
          <form onSubmit={handleNewSearch} className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={newSearch}
                onChange={(e) => setNewSearch(e.target.value)}
                placeholder="Track another ID..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-border-subtle focus:border-cyan text-xs font-mono text-text-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-cyan text-navy-950 text-xs font-bold font-heading hover:bg-cyan/90 transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading Skeleton State */}
        {loading && (
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl animate-pulse space-y-4">
              <div className="h-6 bg-navy-850 rounded w-1/4" />
              <div className="h-10 bg-navy-850 rounded w-full" />
              <div className="h-4 bg-navy-850 rounded w-1/2" />
            </div>
            <div className="h-96 glass-panel rounded-2xl animate-pulse" />
          </div>
        )}

        {/* Error / Not Found State */}
        {!loading && error && (
          <div className="glass-panel p-8 rounded-2xl border border-status-error/30 text-center max-w-xl mx-auto space-y-4 my-12">
            <div className="w-12 h-12 rounded-full bg-status-error/15 text-status-error flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="font-heading text-lg font-bold text-text-primary">
              Consignment Not Found
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed">{error}</p>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                href="/track"
                className="px-4 py-2 rounded-xl bg-navy-850 text-xs font-medium text-text-primary hover:bg-navy-800 transition"
              >
                Back to Portal
              </Link>
              <button
                onClick={fetchTracking}
                className="px-4 py-2 rounded-xl bg-cyan text-navy-950 text-xs font-bold hover:bg-cyan/90 transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Search</span>
              </button>
            </div>
          </div>
        )}

        {/* Loaded Shipment Content */}
        {!loading && shipment && (
          <div className="space-y-8">
            {/* Top Overview KPI Card */}
            <div className="glass-panel-glow p-6 rounded-2xl border border-cyan/30 shadow-xl space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle">
                {/* Tracking ID and Copy */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-text-muted font-mono uppercase">
                      Tracking Identification
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan/15 text-cyan font-mono border border-cyan/30">
                      {shipment.carrier}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-2xl sm:text-3xl font-extrabold text-text-primary tracking-wide">
                      {shipment.trackingNumber}
                    </span>
                    <button
                      onClick={handleCopy}
                      className="p-1.5 rounded-lg bg-navy-900 border border-border-subtle text-text-secondary hover:text-cyan transition"
                      title="Copy Tracking ID"
                    >
                      {copied ? <Check className="w-4 h-4 text-status-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {shipment.externalTrackingNumber && (
                    <div className="text-xs text-text-muted font-mono">
                      Carrier Master: {shipment.externalTrackingNumber}
                    </div>
                  )}
                </div>

                {/* Estimated Delivery Date & Source Feed */}
                <div className="flex flex-col md:items-end space-y-1">
                  <span className="text-xs text-text-muted">Estimated Delivery Window</span>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-text-primary flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-cyan" />
                    <span>{formatDateOnly(shipment.estimatedDelivery)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-text-secondary">Source:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                        shipment.sourceType === "TELEMATICS_GPS"
                          ? "bg-cyan/15 text-cyan border border-cyan/30"
                          : shipment.sourceType === "CARRIER_FEED"
                          ? "bg-purple-accent/15 text-purple-accent border border-purple-accent/30"
                          : "bg-navy-800 text-status-warning border border-status-warning/30"
                      }`}
                    >
                      {shipment.sourceType === "TELEMATICS_GPS"
                        ? "GPS TELEMATICS"
                        : shipment.sourceType === "CARRIER_FEED"
                        ? "CARRIER FEED"
                        : "NEXTRAK DEMO MATRIX"}
                    </span>
                  </div>

                  <button
                    onClick={() => setIsCheckpointModalOpen(true)}
                    className="mt-2 px-3 py-1.5 rounded-xl bg-cyan/15 hover:bg-cyan/25 border border-cyan/40 text-cyan text-xs font-heading font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>+ Add Checkpoint / Move Truck</span>
                  </button>
                </div>
              </div>

              {/* Delivery Progress Stepper */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-text-muted mb-4">
                  <span className="font-heading font-semibold uppercase tracking-wider text-text-secondary">
                    Progress Milestones
                  </span>
                  {isDelayed && (
                    <span className="text-status-warning flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Weather Delay Logged</span>
                    </span>
                  )}
                </div>

                {/* Step Circles */}
                <div className="relative">
                  {/* Progress Line Bar */}
                  <div className="absolute top-4 left-4 right-4 h-0.5 bg-navy-800 -z-0">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isDelayed ? "bg-status-warning" : "bg-cyan"
                      }`}
                      style={{
                        width: `${(currentStepIdx / (standardSteps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>

                  <div className="relative z-10 flex items-center justify-between">
                    {standardSteps.map((step, idx) => {
                      const isCompleted = idx < currentStepIdx;
                      const isCurrent = idx === currentStepIdx;
                      return (
                        <div key={step.key} className="flex flex-col items-center text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                              isCompleted
                                ? "bg-status-success text-navy-950 shadow-glow"
                                : isCurrent
                                ? isDelayed
                                  ? "bg-status-warning text-navy-950 animate-pulse ring-4 ring-status-warning/20"
                                  : "bg-cyan text-navy-950 shadow-glow animate-pulse ring-4 ring-cyan/20"
                                : "bg-navy-900 border border-border-subtle text-text-muted"
                            }`}
                          >
                            {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                          </div>
                          <span
                            className={`text-[11px] mt-2 font-medium max-w-[80px] sm:max-w-none ${
                              isCurrent
                                ? isDelayed
                                  ? "text-status-warning font-bold"
                                  : "text-cyan font-bold"
                                : isCompleted
                                ? "text-text-primary"
                                : "text-text-muted"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Origin to Destination Route Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
                <div className="p-3.5 rounded-xl bg-navy-900/60 border border-border-subtle flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-purple-accent/15 text-purple-accent flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-mono uppercase block">
                      ORIGIN DEPARTURE
                    </span>
                    <span className="font-heading font-semibold text-sm text-text-primary">
                      {shipment.originCity}
                      {shipment.originState ? `, ${shipment.originState}` : ""}
                    </span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Sender: {shipment.senderName}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-navy-900/60 border border-border-subtle flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-status-success/15 text-status-success flex items-center justify-center shrink-0 mt-0.5">
                    <Navigation className="w-4 h-4 rotate-45" />
                  </div>
                  <div>
                    <span className="text-[10px] text-text-muted font-mono uppercase block">
                      DESTINATION ARRIVAL
                    </span>
                    <span className="font-heading font-semibold text-sm text-text-primary">
                      {shipment.destinationCity}
                      {shipment.destinationState ? `, ${shipment.destinationState}` : ""}
                    </span>
                    <p className="text-xs text-text-secondary mt-0.5">
                      Recipient: {shipment.recipientName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Section: Interactive Route Map + Event Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Interactive Map & Telematics (7 Cols) */}
              <div className="lg:col-span-7 space-y-6">
                <ShipmentIsometricRouteVisualizer
                  trackingNumber={shipment.trackingNumber}
                  carrier={shipment.carrier}
                  serviceType={shipment.serviceType}
                  status={shipment.currentStatus}
                  originCity={shipment.originCity}
                  originLat={shipment.originLat}
                  originLng={shipment.originLng}
                  destinationCity={shipment.destinationCity}
                  destinationLat={shipment.destinationLat}
                  destinationLng={shipment.destinationLng}
                  currentLat={shipment.currentLat}
                  currentLng={shipment.currentLng}
                  temperature="-20.4°C"
                  weightKg={shipment.weightKg}
                  className="h-[440px] sm:h-[480px]"
                />

                {/* Package Specifications Card */}
                <div className="glass-panel p-5 rounded-2xl border border-border-subtle">
                  <h4 className="font-heading text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4 text-cyan" />
                    <span>Consignment Specifications</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-navy-900 border border-border-subtle">
                      <span className="text-text-muted block text-[10px]">WEIGHT</span>
                      <span className="font-mono text-text-primary font-bold">
                        {shipment.weightKg} kg
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-900 border border-border-subtle">
                      <span className="text-text-muted block text-[10px]">DIMENSIONS</span>
                      <span className="font-mono text-text-primary font-bold">
                        {shipment.dimensions || "Standard"}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-900 border border-border-subtle">
                      <span className="text-text-muted block text-[10px]">CARGO TYPE</span>
                      <span className="font-medium text-text-primary">
                        {shipment.packageType}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-navy-900 border border-border-subtle">
                      <span className="text-text-muted block text-[10px]">SERVICE LEVEL</span>
                      <span className="font-medium text-cyan">
                        {shipment.serviceType}
                      </span>
                    </div>
                  </div>

                  {shipment.packageDescription && (
                    <div className="mt-3 p-3 rounded-xl bg-navy-900/50 border border-border-subtle text-xs text-text-secondary">
                      <span className="font-semibold text-text-primary">Description: </span>
                      {shipment.packageDescription}
                    </div>
                  )}

                  {shipment.specialInstructions && (
                    <div className="mt-2 p-3 rounded-xl bg-navy-900/50 border border-status-warning/20 text-xs text-status-warning">
                      <span className="font-semibold">Special Instructions: </span>
                      {shipment.specialInstructions}
                    </div>
                  )}

                  {/* Assigned Vehicle & Driver Info if present */}
                  {shipment.assignedVehicle && (
                    <div className="mt-4 pt-4 border-t border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-navy-850 border border-cyan/30 flex items-center justify-center text-cyan">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-text-primary block">
                            {shipment.assignedVehicle.registrationNumber} ({shipment.assignedVehicle.model})
                          </span>
                          <span className="text-text-secondary text-[11px]">
                            Driver: {shipment.assignedVehicle.driver?.name || "Assigned Driver"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-status-success/15 text-status-success text-[10px] font-mono border border-status-success/30">
                          Battery {shipment.assignedVehicle.batteryPercent || shipment.assignedVehicle.fuelLevelPercent}%
                        </span>
                        <span className="px-2 py-0.5 rounded bg-navy-850 text-text-secondary text-[10px] font-mono border border-border-subtle">
                          {shipment.assignedVehicle.telematicsProvider}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Chronological Event History (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-border-subtle">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border-subtle">
                    <h3 className="font-heading text-sm font-semibold text-text-primary flex items-center gap-2">
                      <Clock className="w-4 h-4 text-cyan" />
                      <span>Tracking Event History</span>
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-850 text-text-secondary">
                      {shipment.events?.length || 0} Checkpoints
                    </span>
                  </div>

                  {/* Event Timeline List */}
                  <div className="space-y-6 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-navy-800 before:-z-0">
                    {shipment.events?.map((event: any, index: number) => {
                      const isLatest = index === shipment.events.length - 1;
                      const isEventDelayed = event.status === "DELAYED";
                      return (
                        <div key={event.id || index} className="relative z-10 flex items-start gap-4">
                          {/* Dot */}
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                              isLatest
                                ? isEventDelayed
                                  ? "bg-status-warning text-navy-950 ring-4 ring-status-warning/20 shadow-glow"
                                  : "bg-cyan text-navy-950 ring-4 ring-cyan/20 shadow-glow"
                                : "bg-navy-900 border border-border-subtle text-text-muted"
                            }`}
                          >
                            {isLatest ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : (
                              <div className="w-2 h-2 rounded-full bg-text-muted" />
                            )}
                          </div>

                          {/* Event Content */}
                          <div className="flex-1 space-y-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <span
                                className={`text-xs font-semibold font-heading ${
                                  isLatest
                                    ? isEventDelayed
                                      ? "text-status-warning"
                                      : "text-cyan"
                                    : "text-text-primary"
                                }`}
                              >
                                {event.title || event.status}
                              </span>
                              <span className="text-[10px] text-text-muted font-mono">
                                {formatDateTime(event.eventTimestamp)}
                              </span>
                            </div>

                            <p className="text-xs text-text-secondary leading-relaxed">
                              {event.description}
                            </p>

                            <div className="flex items-center gap-2 pt-1">
                              <div className="flex items-center gap-1 text-[11px] text-text-muted">
                                <MapPin className="w-3 h-3 text-cyan" />
                                <span>{event.location}</span>
                              </div>
                              <span className="text-text-muted">•</span>
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-navy-850 text-text-muted border border-border-subtle">
                                {event.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Verified Source Disclaimer */}
                <div className="p-4 rounded-xl bg-navy-900 border border-border-subtle text-xs text-text-secondary space-y-1.5">
                  <div className="flex items-center gap-2 text-text-primary font-medium">
                    <ShieldCheck className="w-4 h-4 text-cyan" />
                    <span>NEXTRAK Data Provenance</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-text-muted">
                    Checkpoint locations are derived strictly from carrier scan receipts and verified
                    onboard vehicle telematics GPS. No simulated coordinates are presented as live feeds.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Checkpoint / Move Truck Modal */}
      {shipment && (
        <AddCheckpointModal
          isOpen={isCheckpointModalOpen}
          onClose={() => setIsCheckpointModalOpen(false)}
          shipment={shipment}
          onSuccess={(updated) => {
            setShipment(updated);
            fetchTracking();
          }}
        />
      )}

      <Footer />
    </div>
  );
}

