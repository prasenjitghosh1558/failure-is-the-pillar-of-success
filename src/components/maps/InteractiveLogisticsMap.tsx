"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Truck,
  Package,
  MapPin,
  Navigation,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";

export interface MapMarker {
  id: string;
  type: "shipment" | "vehicle" | "hub";
  title: string;
  subtitle?: string;
  lat: number;
  lng: number;
  status?: string;
  sourceType?: "CARRIER_FEED" | "TELEMATICS_GPS" | "SYSTEM_DEMO";
  speedMph?: number;
  batteryPercent?: number;
  routeCoordinates?: [number, number][]; // [lng, lat]
  origin?: { city: string; lat: number; lng: number };
  destination?: { city: string; lat: number; lng: number };
}

interface InteractiveLogisticsMapProps {
  markers?: MapMarker[];
  selectedId?: string | null;
  onSelectMarker?: (marker: MapMarker) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
  showControls?: boolean;
  className?: string;
}

export function InteractiveLogisticsMap({
  markers = [],
  selectedId,
  onSelectMarker,
  center = { lat: 39.8283, lng: -98.5795 }, // US Geographic Center
  zoom = 4,
  showControls = true,
  className = "h-[500px]",
}: InteractiveLogisticsMapProps) {
  const [activeMarker, setActiveMarker] = useState<MapMarker | null>(null);
  const [zoomLevel, setZoomLevel] = useState(zoom);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const isMapboxConfigured = Boolean(mapboxToken && mapboxToken.startsWith("pk."));

  useEffect(() => {
    if (selectedId) {
      const match = markers.find((m) => m.id === selectedId);
      if (match) setActiveMarker(match);
    }
  }, [selectedId, markers]);

  // Project lat/lng to normalized (0 - 1000) canvas coordinates (Mercator-like projection)
  const project = (lat: number, lng: number) => {
    // Check if Indian coordinates (lat 7 to 38, lng 67 to 98)
    const isIndia = lat >= 6 && lat <= 39 && lng >= 66 && lng <= 99;
    const minLat = isIndia ? 7.5 : 22;
    const maxLat = isIndia ? 37.5 : 52;
    const minLng = isIndia ? 67.5 : -128;
    const maxLng = isIndia ? 97.5 : -65;

    const x = ((lng - minLng) / (maxLng - minLng)) * 1000;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 600;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - mapPan.x, y: e.clientY - mapPan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMapPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetView = () => {
    setZoomLevel(4);
    setMapPan({ x: 0, y: 0 });
  };

  return (
    <div
      className={`relative w-full rounded-xl overflow-hidden border border-border-subtle bg-navy-950 select-none ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Map Header Status Bar */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <div className="glass-panel px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs text-text-primary shadow-lg border border-border-subtle">
          <div className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
          <span className="font-heading font-medium tracking-wide">
            {isMapboxConfigured ? "Mapbox Vector Engine" : "NEXTRAK Geospatial Matrix"}
          </span>
          <span className="text-[10px] text-text-secondary border-l border-border-subtle pl-2">
            {markers.length} Assets Live
          </span>
        </div>

        {/* Source Badge Notice */}
        <div className="hidden sm:flex glass-panel px-2.5 py-1.5 rounded-lg items-center gap-1.5 text-[11px] text-text-secondary">
          <Info className="w-3.5 h-3.5 text-cyan" />
          <span>Verified GPS & Carrier feeds distinguished</span>
        </div>
      </div>

      {/* Map Control Buttons */}
      {showControls && (
        <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
          <button
            onClick={() => setZoomLevel((z) => Math.min(z + 0.5, 8))}
            className="w-8 h-8 rounded-lg glass-panel hover:bg-navy-800 text-text-primary flex items-center justify-center transition border border-border-subtle shadow-md"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-cyan" />
          </button>
          <button
            onClick={() => setZoomLevel((z) => Math.max(z - 0.5, 2))}
            className="w-8 h-8 rounded-lg glass-panel hover:bg-navy-800 text-text-primary flex items-center justify-center transition border border-border-subtle shadow-md"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-cyan" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-lg glass-panel hover:bg-navy-800 text-text-primary flex items-center justify-center transition border border-border-subtle shadow-md"
            title="Reset Perspective"
          >
            <RotateCcw className="w-4 h-4 text-text-secondary" />
          </button>
        </div>
      )}

      {/* Interactive Map Canvas Layer */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75"
        style={{
          transform: `translate(${mapPan.x}px, ${mapPan.y}px) scale(${zoomLevel / 4})`,
          transformOrigin: "center center",
        }}
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(0, 212, 255, 0.04)"
                strokeWidth="1"
              />
            </pattern>

            {/* Glowing Gradient for Routes */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid */}
          <rect width="1000" height="600" fill="#0A1224" />
          <rect width="1000" height="600" fill="url(#grid)" />

          {/* Stylized Continental Outline Base (India Sovereign Territory) */}
          <g opacity="0.45" fill="rgba(16, 27, 48, 0.4)" stroke="#00F2FE" strokeWidth="1.2">
            <path d="M 330 30 L 370 50 L 420 90 L 440 140 L 400 170 L 430 200 L 480 230 L 580 250 L 640 220 L 710 240 L 680 320 L 630 400 L 600 370 L 540 430 L 480 500 L 400 580 L 340 590 L 320 540 L 250 500 L 170 460 L 150 400 L 190 320 L 230 230 L 270 140 Z" />
          </g>

          {/* Major Indian Freight Hub Corridor Nodes */}
          <g fontSize="9" fill="#9AAAC0" fontFamily="monospace" fontWeight="600">
            <text x="330" y="190">DELHI NCR</text>
            <text x="180" y="375">MUMBAI / JNPT</text>
            <text x="150" y="295">AHMEDABAD</text>
            <text x="390" y="335">NAGPUR</text>
            <text x="690" y="305">KOLKATA</text>
            <text x="365" y="405">HYDERABAD</text>
            <text x="335" y="490">BENGALURU</text>
            <text x="425" y="485">CHENNAI</text>
            <text x="790" y="240">GUWAHATI</text>
          </g>

          {/* Render Route Paths */}
          {markers.map((marker) => {
            if (!marker.origin || !marker.destination) return null;
            const p1 = project(marker.origin.lat, marker.origin.lng);
            const p2 = project(marker.destination.lat, marker.destination.lng);
            const isSelected = activeMarker?.id === marker.id;

            // Arc control point for sleek curvature
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - 25;

            return (
              <g key={`route-${marker.id}`}>
                <path
                  d={`M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`}
                  fill="none"
                  stroke={isSelected ? "#00D4FF" : "rgba(108, 99, 255, 0.35)"}
                  strokeWidth={isSelected ? "3" : "1.8"}
                  strokeDasharray={isSelected ? "none" : "6 4"}
                  filter={isSelected ? "url(#glow)" : undefined}
                />
                {/* Origin Pin */}
                <circle cx={p1.x} cy={p1.y} r="3" fill="#6C63FF" />
                {/* Destination Pin */}
                <circle cx={p2.x} cy={p2.y} r="3" fill="#20C997" />
              </g>
            );
          })}

          {/* Render Markers */}
          {markers.map((marker) => {
            const { x, y } = project(marker.lat, marker.lng);
            const isSelected = activeMarker?.id === marker.id;

            return (
              <g
                key={marker.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMarker(marker);
                  if (onSelectMarker) onSelectMarker(marker);
                }}
              >
                {/* Pulsing Target Ring */}
                <circle
                  r={isSelected ? "14" : "9"}
                  fill="none"
                  stroke={marker.type === "vehicle" ? "#00D4FF" : "#6C63FF"}
                  strokeWidth="1.5"
                  opacity={isSelected ? "0.9" : "0.5"}
                >
                  <animate
                    attributeName="r"
                    values={isSelected ? "10;18;10" : "6;12;6"}
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.8;0.1;0.8"
                    dur="2.5s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Center Marker Dot */}
                <circle
                  r={isSelected ? "7" : "5"}
                  fill={marker.type === "vehicle" ? "#00D4FF" : "#20C997"}
                  filter="url(#glow)"
                />

                {/* Marker ID Tag Label */}
                <rect
                  x="-35"
                  y="-26"
                  width="70"
                  height="16"
                  rx="4"
                  fill="rgba(8, 14, 27, 0.85)"
                  stroke={isSelected ? "#00D4FF" : "rgba(255,255,255,0.15)"}
                  strokeWidth="0.8"
                />
                <text
                  x="0"
                  y="-15"
                  fill="#F4F7FC"
                  fontSize="8"
                  fontFamily="monospace"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {marker.title}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Marker Detail Card Popover */}
      <AnimatePresence>
        {activeMarker && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm z-30 glass-panel-glow p-4 rounded-xl border border-cyan/40 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan/15 flex items-center justify-center text-cyan">
                  {activeMarker.type === "vehicle" ? (
                    <Truck className="w-4 h-4" />
                  ) : (
                    <Package className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-heading font-semibold text-text-primary">
                    {activeMarker.title}
                  </h4>
                  <p className="text-xs text-text-secondary">{activeMarker.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveMarker(null)}
                className="text-text-muted hover:text-text-primary text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Source indicator */}
            <div className="mt-3 pt-2.5 border-t border-border-subtle flex items-center justify-between text-xs">
              <span className="text-text-secondary">Source Feed:</span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                  activeMarker.sourceType === "TELEMATICS_GPS"
                    ? "bg-cyan/15 text-cyan border border-cyan/30"
                    : activeMarker.sourceType === "CARRIER_FEED"
                    ? "bg-purple-accent/15 text-purple-accent border border-purple-accent/30"
                    : "bg-navy-800 text-status-warning border border-status-warning/30"
                }`}
              >
                {activeMarker.sourceType === "TELEMATICS_GPS"
                  ? "LIVE GPS TELEMATICS"
                  : activeMarker.sourceType === "CARRIER_FEED"
                  ? "CARRIER EVENT FEED"
                  : "DEMO MATRIX"}
              </span>
            </div>

            {/* Key telemetry */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-navy-900/80 p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted block text-[10px]">COORDINATES</span>
                <span className="font-mono text-text-primary">
                  {activeMarker.lat.toFixed(3)}, {activeMarker.lng.toFixed(3)}
                </span>
              </div>
              <div className="bg-navy-900/80 p-2 rounded-lg border border-border-subtle">
                <span className="text-text-muted block text-[10px]">STATUS</span>
                <span className="text-status-success font-medium">
                  {activeMarker.status || "Operational"}
                </span>
              </div>
            </div>

            {activeMarker.origin && activeMarker.destination && (
              <div className="mt-2 text-xs flex items-center justify-between text-text-secondary bg-navy-900/50 p-2 rounded-lg border border-border-subtle">
                <span>{activeMarker.origin.city}</span>
                <Navigation className="w-3.5 h-3.5 text-cyan rotate-90" />
                <span>{activeMarker.destination.city}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

