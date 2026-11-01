"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  Compass,
  Package,
  Truck,
  MapPin,
  Clock,
  Layers,
  Radio,
  ExternalLink,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { IndiaConsignmentTracker, MockConsignment } from "@/components/dashboard/IndiaConsignmentTracker";
import { TelemetryBentoSidebar } from "@/components/dashboard/TelemetryBentoSidebar";
import { IndiaFreightCalculator } from "@/components/dashboard/IndiaFreightCalculator";

// Code-split the MapLibre + iamaware cartographic bundle (SSR disabled)
const IamAwareLiveTrackingMap = dynamic(
  () =>
    import("@/components/map/IamAwareLiveTrackingMap").then(
      (mod) => mod.IamAwareLiveTrackingMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[640px] w-full rounded-2xl glass-panel border border-border-subtle flex flex-col items-center justify-center space-y-3 bg-slate-950/80">
        <div className="w-8 h-8 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-cyan tracking-wider uppercase">
          Initializing iamaware.in Cartographic Engine & Web Worker...
        </span>
      </div>
    ),
  }
);

export default function LiveTrackingDashboard() {
  const [activeConsignment, setActiveConsignment] = useState<MockConsignment | null>(null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse" />
            <span className="text-xs font-mono text-cyan tracking-wider uppercase font-semibold">
              PAN-INDIA MEDICAL COLD-CHAIN COMMAND • CDSCO & WHO-GDP VERIFIED
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-2.5">
            <Compass className="w-7 h-7 text-cyan" />
            <span>National Medical Cold-Chain & Vaccine Telemetry Matrix</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1 max-w-2xl">
            Real-time zero-excursion tracking of cryogenic biologics (-80°C to +25°C), WDFC refrigerated
            container rakes, emergency air plasma lifelines, and hospital inward manifests across 28 States & 8 UTs.
          </p>
        </div>

        {/* Live Status Indicators */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl glass-panel text-xs flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-status-success animate-pulse" />
            <div>
              <span className="text-text-muted text-[10px] block font-mono">CDSCO / BLE SENSORS</span>
              <span className="font-bold text-text-primary font-mono text-xs">
                99.94% Zero-Excursion
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 1. Live Consignment Tracker Bar (Top Center) with Timeline */}
      <IndiaConsignmentTracker
        onSelectConsignment={(consignment) => setActiveConsignment(consignment)}
      />

      {/* 2. Main Centerpiece: iamaware.in MapLibre GL Cartographic Engine + Telemetry Bento Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive India Map (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <IamAwareLiveTrackingMap
            className="h-[640px]"
            selectedTrackingId={activeConsignment?.trackingId}
            onSelectShipment={(trackingId) => {
              // Live shipment selection synchronized with dashboard
            }}
          />
        </div>

        {/* Telemetry & Operations Bento Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <TelemetryBentoSidebar />
        </div>
      </div>

      {/* 3. Interactive India Freight Quote & Booking Calculator */}
      <div className="pt-2">
        <IndiaFreightCalculator />
      </div>
    </div>
  );
}
