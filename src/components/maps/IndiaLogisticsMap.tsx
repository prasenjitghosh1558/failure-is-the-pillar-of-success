"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Truck,
  Package,
  MapPin,
  Navigation,
  Train,
  Plane,
  Thermometer,
  ShieldAlert,
  CloudSun,
  Activity,
  CheckCircle2,
  X,
  TrendingUp,
} from "lucide-react";

export interface IndiaHub {
  id: string;
  name: string;
  shortCode: string;
  category: string;
  lat: number;
  lng: number;
  activeTrucks: number;
  activeTrains?: number;
  warehouseCapacity: number; // percentage
  warehouseSqFt: string;
  weather: string;
  trafficStatus: "Optimal" | "Moderate" | "Congested";
  incomingCount: number;
  outgoingCount: number;
  recentManifests: { id: string; destination: string; status: string }[];
}

export interface FreightCorridor {
  id: string;
  name: string;
  code: string;
  fromHubId: string;
  toHubId: string;
  mode: "ROAD" | "RAIL_DFC" | "AIR" | "COLD_CHAIN";
  distanceKm: number;
  avgSpeedKmH: number;
  activeFleet: number;
  status: "OPTIMAL" | "DELAY" | "EXPRESS";
  statusReason?: string;
  delayMinutes?: number;
  transitHours: number;
  controlPoints: { x: number; y: number }[];
}

export const INDIA_HUBS: IndiaHub[] = [
  {
    id: "delhi",
    name: "Delhi NCR",
    shortCode: "DEL",
    category: "Northern Multimodal Freight Gateway",
    lat: 28.6139,
    lng: 77.209,
    activeTrucks: 142,
    activeTrains: 18,
    warehouseCapacity: 84,
    warehouseSqFt: "4.2M sq.ft",
    weather: "26°C Clear",
    trafficStatus: "Moderate",
    incomingCount: 88,
    outgoingCount: 114,
    recentManifests: [
      { id: "IND-9042-MUM", destination: "Mumbai JNPT", status: "In Transit" },
      { id: "BLR-DEL-771", destination: "Delhi North Hub", status: "Out for Delivery" },
    ],
  },
  {
    id: "mumbai",
    name: "Mumbai / JNPT Port",
    shortCode: "BOM",
    category: "Western Maritime & Mega Container Hub",
    lat: 18.95,
    lng: 72.82,
    activeTrucks: 186,
    activeTrains: 24,
    warehouseCapacity: 92,
    warehouseSqFt: "6.8M sq.ft",
    weather: "31°C Coastal Breeze",
    trafficStatus: "Optimal",
    incomingCount: 135,
    outgoingCount: 160,
    recentManifests: [
      { id: "IND-9042-MUM", destination: "Mumbai Docks", status: "Arrived at Port" },
      { id: "MUM-AHM-102", destination: "Ahmedabad Western Hub", status: "Dispatched" },
    ],
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad / Mundra",
    shortCode: "AMD",
    category: "Western Industrial & DFC Terminal",
    lat: 23.0225,
    lng: 72.5714,
    activeTrucks: 98,
    activeTrains: 16,
    warehouseCapacity: 76,
    warehouseSqFt: "3.5M sq.ft",
    weather: "33°C Sunny",
    trafficStatus: "Optimal",
    incomingCount: 64,
    outgoingCount: 82,
    recentManifests: [
      { id: "MUM-AHM-102", destination: "Ahmedabad Logistics Park", status: "In Transit" },
    ],
  },
  {
    id: "nagpur",
    name: "Nagpur Zero-Mile",
    shortCode: "NAG",
    category: "Central Multimodal Inland Hub (MIHAN)",
    lat: 21.1458,
    lng: 79.0882,
    activeTrucks: 84,
    activeTrains: 14,
    warehouseCapacity: 68,
    warehouseSqFt: "5.1M sq.ft",
    weather: "29°C Clear",
    trafficStatus: "Optimal",
    incomingCount: 72,
    outgoingCount: 69,
    recentManifests: [
      { id: "NAG-HYD-502", destination: "Hyderabad Hub", status: "In Transit" },
      { id: "DEL-NAG-401", destination: "Nagpur Depot", status: "Completed" },
    ],
  },
  {
    id: "kolkata",
    name: "Kolkata / Haldia",
    shortCode: "CCU",
    category: "Eastern Riverine & Maritime Port Gateway",
    lat: 22.5726,
    lng: 88.3639,
    activeTrucks: 94,
    activeTrains: 12,
    warehouseCapacity: 82,
    warehouseSqFt: "3.8M sq.ft",
    weather: "28°C Humid",
    trafficStatus: "Moderate",
    incomingCount: 56,
    outgoingCount: 74,
    recentManifests: [
      { id: "KOL-CHN-309", destination: "Chennai Port", status: "In Transit" },
      { id: "KOL-GAU-108", destination: "Guwahati Gateway", status: "In Transit" },
    ],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    shortCode: "HYD",
    category: "South-Central Tech & Pharma Logistics Hub",
    lat: 17.385,
    lng: 78.4867,
    activeTrucks: 112,
    activeTrains: 10,
    warehouseCapacity: 74,
    warehouseSqFt: "4.5M sq.ft",
    weather: "27°C Pleasant",
    trafficStatus: "Optimal",
    incomingCount: 84,
    outgoingCount: 92,
    recentManifests: [
      { id: "NAG-HYD-502", destination: "Hyderabad Pharma City", status: "Out for Delivery" },
      { id: "HYD-BLR-892", destination: "Bengaluru Tech Hub", status: "In Transit" },
    ],
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    shortCode: "BLR",
    category: "Southern High-Tech & Air Cargo Hub",
    lat: 12.9716,
    lng: 77.5946,
    activeTrucks: 136,
    activeTrains: 8,
    warehouseCapacity: 89,
    warehouseSqFt: "5.8M sq.ft",
    weather: "24°C Breezy",
    trafficStatus: "Moderate",
    incomingCount: 110,
    outgoingCount: 124,
    recentManifests: [
      { id: "BLR-DEL-771", destination: "Delhi IGI Airport", status: "Air Cargo In Flight" },
      { id: "BLR-CHN-440", destination: "Chennai Port", status: "Dispatched" },
    ],
  },
  {
    id: "chennai",
    name: "Chennai Port",
    shortCode: "MAA",
    category: "Coromandel Auto & Heavy Industry Port",
    lat: 13.0827,
    lng: 80.2707,
    activeTrucks: 118,
    activeTrains: 12,
    warehouseCapacity: 81,
    warehouseSqFt: "4.9M sq.ft",
    weather: "30°C Coastal Humid",
    trafficStatus: "Optimal",
    incomingCount: 78,
    outgoingCount: 95,
    recentManifests: [
      { id: "KOL-CHN-309", destination: "Chennai Ennore Port", status: "Berthing Scheduled" },
      { id: "BLR-CHN-440", destination: "Chennai Auto Corridor", status: "In Transit" },
    ],
  },
  {
    id: "guwahati",
    name: "Guwahati",
    shortCode: "GAU",
    category: "North-Eastern Seven Sisters Gateway",
    lat: 26.1445,
    lng: 91.7362,
    activeTrucks: 46,
    activeTrains: 6,
    warehouseCapacity: 62,
    warehouseSqFt: "1.9M sq.ft",
    weather: "22°C Clear",
    trafficStatus: "Optimal",
    incomingCount: 38,
    outgoingCount: 29,
    recentManifests: [
      { id: "KOL-GAU-108", destination: "Guwahati Inland Depot", status: "In Transit" },
    ],
  },
];

export const FREIGHT_CORRIDORS: FreightCorridor[] = [
  // Golden Quadrilateral: Delhi - Mumbai (NH-48)
  {
    id: "c-del-bom",
    name: "Delhi ↔ Mumbai (NH-48 Expressway Corridor)",
    code: "GQ-W1",
    fromHubId: "delhi",
    toHubId: "mumbai",
    mode: "ROAD",
    distanceKm: 1410,
    avgSpeedKmH: 64,
    activeFleet: 58,
    status: "DELAY",
    statusReason: "Bharuch Bridge Maintenance (+25 mins)",
    delayMinutes: 25,
    transitHours: 24,
    controlPoints: [
      { x: 261, y: 287 },
      { x: 200, y: 380 },
      { x: 144, y: 442 },
      { x: 151, y: 555 },
    ],
  },
  // Western Dedicated Freight Corridor (DFC Rail)
  {
    id: "c-wdfc-rail",
    name: "Western DFC (Dadri ↔ JNPT Port Heavy Rail)",
    code: "W-DFC",
    fromHubId: "delhi",
    toHubId: "mumbai",
    mode: "RAIL_DFC",
    distanceKm: 1504,
    avgSpeedKmH: 78,
    activeFleet: 22,
    status: "EXPRESS",
    statusReason: "Double-Stack Container Express On-Time",
    transitHours: 18,
    controlPoints: [
      { x: 261, y: 287 },
      { x: 185, y: 395 },
      { x: 140, y: 470 },
      { x: 151, y: 555 },
    ],
  },
  // Golden Quadrilateral: Mumbai - Chennai (via Bengaluru)
  {
    id: "c-bom-blr",
    name: "Mumbai ↔ Bengaluru (NH-48 Pune Corridor)",
    code: "GQ-SW",
    fromHubId: "mumbai",
    toHubId: "bengaluru",
    mode: "ROAD",
    distanceKm: 984,
    avgSpeedKmH: 68,
    activeFleet: 44,
    status: "OPTIMAL",
    transitHours: 16,
    controlPoints: [
      { x: 151, y: 555 },
      { x: 195, y: 640 },
      { x: 270, y: 722 },
    ],
  },
  // Bengaluru - Chennai Expressway
  {
    id: "c-blr-maa",
    name: "Bengaluru ↔ Chennai Port Expressway",
    code: "GQ-S1",
    fromHubId: "bengaluru",
    toHubId: "chennai",
    mode: "ROAD",
    distanceKm: 348,
    avgSpeedKmH: 76,
    activeFleet: 62,
    status: "EXPRESS",
    statusReason: "High-Speed Access Controlled",
    transitHours: 5,
    controlPoints: [
      { x: 270, y: 722 },
      { x: 305, y: 720 },
      { x: 337, y: 719 },
    ],
  },
  // Golden Quadrilateral: Chennai - Kolkata (NH-16 Coastal)
  {
    id: "c-maa-ccu",
    name: "Chennai ↔ Kolkata Coastal Corridor (NH-16)",
    code: "GQ-E1",
    fromHubId: "chennai",
    toHubId: "kolkata",
    mode: "ROAD",
    distanceKm: 1660,
    avgSpeedKmH: 62,
    activeFleet: 39,
    status: "OPTIMAL",
    transitHours: 28,
    controlPoints: [
      { x: 337, y: 719 },
      { x: 420, y: 610 },
      { x: 490, y: 520 },
      { x: 540, y: 455 },
    ],
  },
  // Golden Quadrilateral: Kolkata - Delhi (NH-19 Grand Trunk)
  {
    id: "c-ccu-del",
    name: "Kolkata ↔ Delhi Grand Trunk Corridor (NH-19)",
    code: "GQ-N1",
    fromHubId: "kolkata",
    toHubId: "delhi",
    mode: "ROAD",
    distanceKm: 1490,
    avgSpeedKmH: 65,
    activeFleet: 52,
    status: "OPTIMAL",
    transitHours: 24,
    controlPoints: [
      { x: 540, y: 455 },
      { x: 440, y: 390 },
      { x: 340, y: 330 },
      { x: 261, y: 287 },
    ],
  },
  // North-South Corridor: Delhi - Nagpur - Hyderabad - Bengaluru (NH-44)
  {
    id: "c-ns-corridor",
    name: "North-South Spine (Delhi ↔ Nagpur ↔ Hyderabad ↔ BLR)",
    code: "NS-44",
    fromHubId: "delhi",
    toHubId: "bengaluru",
    mode: "ROAD",
    distanceKm: 2180,
    avgSpeedKmH: 70,
    activeFleet: 78,
    status: "EXPRESS",
    statusReason: "Multi-Axle Super Freight Express",
    transitHours: 32,
    controlPoints: [
      { x: 261, y: 287 },
      { x: 308, y: 495 },
      { x: 293, y: 599 },
      { x: 270, y: 722 },
    ],
  },
  // East-West Corridor to North East: Kolkata to Guwahati
  {
    id: "c-ccu-gau",
    name: "Siliguri Chicken's Neck ↔ Guwahati Gateway",
    code: "NE-COR",
    fromHubId: "kolkata",
    toHubId: "guwahati",
    mode: "ROAD",
    distanceKm: 990,
    avgSpeedKmH: 52,
    activeFleet: 28,
    status: "DELAY",
    statusReason: "Hill Fog & Checkpost Security Inspection",
    delayMinutes: 35,
    transitHours: 22,
    controlPoints: [
      { x: 540, y: 455 },
      { x: 520, y: 330 },
      { x: 625, y: 356 },
    ],
  },
  // Domestic Air Cargo: Bengaluru to Delhi (Indigo Cargo / SpiceXpress)
  {
    id: "c-air-blr-del",
    name: "BLR ✈ DEL Air Cargo Express Corridor",
    code: "AIR-01",
    fromHubId: "bengaluru",
    toHubId: "delhi",
    mode: "AIR",
    distanceKm: 1740,
    avgSpeedKmH: 720,
    activeFleet: 14,
    status: "EXPRESS",
    statusReason: "Direct A321 Freighter In-Flight",
    transitHours: 2.5,
    controlPoints: [
      { x: 270, y: 722 },
      { x: 280, y: 500 },
      { x: 261, y: 287 },
    ],
  },
  // Cold Chain: Hyderabad Pharma to Mumbai JNPT
  {
    id: "c-cold-hyd-bom",
    name: "Hyderabad Genome Valley ↔ Mumbai JNPT (Reefer Cold Chain)",
    code: "COLD-PHARMA",
    fromHubId: "hyderabad",
    toHubId: "mumbai",
    mode: "COLD_CHAIN",
    distanceKm: 710,
    avgSpeedKmH: 60,
    activeFleet: 32,
    status: "EXPRESS",
    statusReason: "Active Temperature Logging (-20°C Verified)",
    transitHours: 13,
    controlPoints: [
      { x: 293, y: 599 },
      { x: 220, y: 575 },
      { x: 151, y: 555 },
    ],
  },
];

interface IndiaLogisticsMapProps {
  className?: string;
  selectedTrackingId?: string | null;
  onSelectHub?: (hub: IndiaHub) => void;
  onSelectCorridor?: (corridor: FreightCorridor) => void;
}

export function IndiaLogisticsMap({
  className = "h-[620px]",
  selectedTrackingId,
  onSelectHub,
  onSelectCorridor,
}: IndiaLogisticsMapProps) {
  const [selectedHub, setSelectedHub] = useState<IndiaHub | null>(null);
  const [hoveredCorridor, setHoveredCorridor] = useState<FreightCorridor | null>(null);
  const [activeFilter, setActiveFilter] = useState<
    "ALL" | "RAIL_DFC" | "ROAD" | "AIR" | "COLD_CHAIN"
  >("ALL");

  const [zoomLevel, setZoomLevel] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // Map projection helpers for India SVG canvas (viewBox 0 0 800 900)
  const projectCoordinates = (lat: number, lng: number) => {
    const minLat = 7.5;
    const maxLat = 37.5;
    const minLng = 67.5;
    const maxLng = 97.5;
    const x = ((lng - minLng) / (maxLng - minLng)) * 740 + 30;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 820 + 40;
    return { x, y };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setZoomLevel(1);
    setPan({ x: 0, y: 0 });
    setSelectedHub(null);
  };

  // Filter corridors
  const filteredCorridors = FREIGHT_CORRIDORS.filter((c) => {
    if (activeFilter === "ALL") return true;
    return c.mode === activeFilter;
  });

  return (
    <div
      className={`relative w-full rounded-2xl overflow-hidden glass-panel select-none border border-cyan/20 ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Top Floating Header & Filter Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left Badge: Official Map of India */}
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950/85 backdrop-blur-md border border-cyan/40 shadow-lg text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse" />
          <span className="font-heading font-bold text-text-primary tracking-wide">
            India Freight & Telemetry Matrix
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
            28 States • 8 UTs
          </span>
        </div>

        {/* Right Filter Pills */}
        <div className="pointer-events-auto flex items-center gap-1.5 p-1 rounded-xl bg-navy-950/85 backdrop-blur-md border border-border-subtle shadow-lg text-xs overflow-x-auto max-w-full">
          {[
            { id: "ALL", label: "All Corridors", icon: Layers },
            { id: "RAIL_DFC", label: "DFC Rail Freight", icon: Train },
            { id: "ROAD", label: "NH-44 / NH-48 Road", icon: Truck },
            { id: "AIR", label: "Air Cargo Express", icon: Plane },
            { id: "COLD_CHAIN", label: "Cold Chain (-20°C)", icon: Thermometer },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  isActive
                    ? "bg-cyan text-navy-950 font-bold shadow-glow"
                    : "text-text-secondary hover:text-text-primary hover:bg-navy-900/60"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive SVG Canvas Layer */}
      <div
        className="w-full h-full cursor-grab active:cursor-grabbing transition-transform duration-75 flex items-center justify-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`,
          transformOrigin: "center center",
        }}
      >
        <svg
          viewBox="0 0 800 900"
          className="w-full h-full max-h-[880px]"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="indiaGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 0 0 0 30"
                fill="none"
                stroke="rgba(0, 242, 254, 0.035)"
                strokeWidth="0.8"
              />
            </pattern>

            {/* Glowing Gradients */}
            <linearGradient id="corridorGlowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="corridorGlowOrange" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B00" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FFB547" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="corridorGlowEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#00F2FE" stopOpacity="0.95" />
            </linearGradient>

            {/* Filter Effects */}
            <filter id="hubGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Canvas Background */}
          <rect width="800" height="900" fill="transparent" />
          <rect width="800" height="900" fill="url(#indiaGrid)" />

          {/* ==============================================================
              OFFICIAL ACCURATE INDIA GEOGRAPHIC VECTOR BOUNDARY
              Strictly mapped to official Indian sovereign borders
              ============================================================== */}
          <g id="india-boundary" className="transition-all duration-300">
            {/* Outer Ambient Glow of Indian Landmass */}
            <path
              d="
                M 270 45
                L 295 60
                L 338 95
                L 350 140
                L 320 165
                L 305 185
                L 345 220
                L 380 235
                L 440 260
                L 470 275
                L 510 275
                L 535 250
                L 575 240
                L 630 195
                L 695 190
                L 720 220
                L 700 270
                L 680 320
                L 670 350
                L 645 425
                L 625 420
                L 610 385
                L 580 360
                L 540 370
                L 530 435
                L 545 470
                L 505 525
                L 440 595
                L 375 660
                L 337 725
                L 310 795
                L 275 835
                L 250 800
                L 220 735
                L 185 670
                L 155 580
                L 140 540
                L 135 480
                L 100 495
                L 65 470
                L 60 430
                L 85 410
                L 115 340
                L 135 300
                L 165 245
                L 190 215
                L 210 160
                L 240 90
                Z
              "
              fill="rgba(16, 27, 48, 0.45)"
              stroke="rgba(0, 242, 254, 0.4)"
              strokeWidth="2"
              filter="drop-shadow(0 0 12px rgba(0, 242, 254, 0.15))"
            />

            {/* Internal State Corridor Partition Accents */}
            <g stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" fill="none">
              <path d="M 261 287 L 308 495 L 293 599 L 270 722" strokeDasharray="3 3" />
              <path d="M 144 442 L 308 495 L 540 455 L 625 356" strokeDasharray="3 3" />
              <path d="M 151 555 L 293 599 L 337 719" strokeDasharray="3 3" />
            </g>

            {/* Andaman & Nicobar Islands (South-East) */}
            <g fill="rgba(0, 242, 254, 0.6)" stroke="rgba(0, 242, 254, 0.8)" strokeWidth="0.8">
              <ellipse cx="690" cy="720" rx="4" ry="12" />
              <ellipse cx="695" cy="745" rx="3.5" ry="8" />
              <ellipse cx="700" cy="775" rx="4" ry="14" />
              <ellipse cx="705" cy="810" rx="3" ry="9" />
              <text x="670" y="835" fill="#60728C" fontSize="8" fontFamily="monospace">
                ANDAMAN & NICOBAR
              </text>
            </g>

            {/* Lakshadweep Islands (South-West) */}
            <g fill="rgba(0, 242, 254, 0.6)" stroke="rgba(0, 242, 254, 0.8)" strokeWidth="0.8">
              <circle cx="185" cy="740" r="2.5" />
              <circle cx="190" cy="760" r="3" />
              <circle cx="195" cy="780" r="2.5" />
              <circle cx="180" cy="800" r="3" />
              <text x="110" y="810" fill="#60728C" fontSize="8" fontFamily="monospace">
                LAKSHADWEEP
              </text>
            </g>
          </g>

          {/* ==============================================================
              ANIMATED FREIGHT CORRIDOR ARCS & CARGO PULSES
              ============================================================== */}
          <g id="freight-corridors">
            {filteredCorridors.map((corridor) => {
              const points = corridor.controlPoints;
              let pathD = `M ${points[0].x} ${points[0].y}`;
              for (let i = 1; i < points.length; i++) {
                pathD += ` L ${points[i].x} ${points[i].y}`;
              }

              const isHovered = hoveredCorridor?.id === corridor.id;
              const strokeColor =
                corridor.status === "EXPRESS"
                  ? "url(#corridorGlowEmerald)"
                  : corridor.status === "DELAY"
                  ? "url(#corridorGlowOrange)"
                  : "url(#corridorGlowCyan)";

              const strokeWidth = isHovered ? 4.5 : corridor.mode === "RAIL_DFC" ? 3.5 : 2.5;

              return (
                <g
                  key={corridor.id}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredCorridor(corridor)}
                  onMouseLeave={() => setHoveredCorridor(null)}
                  onClick={() => {
                    if (onSelectCorridor) onSelectCorridor(corridor);
                  }}
                >
                  {/* Invisible broad stroke for effortless hover capture */}
                  <path d={pathD} fill="none" stroke="transparent" strokeWidth="18" />

                  {/* Base Route Line */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={
                      corridor.mode === "RAIL_DFC"
                        ? "8 4"
                        : corridor.mode === "AIR"
                        ? "4 4"
                        : "none"
                    }
                    opacity={isHovered ? 1 : 0.8}
                    filter={isHovered ? "url(#hubGlow)" : undefined}
                    className="transition-all duration-200"
                  />

                  {/* Animated Glowing Cargo Pulses along the route */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={
                      corridor.status === "DELAY"
                        ? "#FF6B00"
                        : corridor.status === "EXPRESS"
                        ? "#10B981"
                        : "#00F2FE"
                    }
                    strokeWidth={strokeWidth + 1}
                    strokeDasharray="12 180"
                    strokeLinecap="round"
                    className="animate-pulse"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="0;-380"
                      dur={corridor.mode === "AIR" ? "2.5s" : "6s"}
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            })}
          </g>

          {/* ==============================================================
              MAJOR LOGISTICS HUB NODES (INTERACTIVE PINS)
              ============================================================== */}
          <g id="india-hubs">
            {INDIA_HUBS.map((hub) => {
              const { x, y } = projectCoordinates(hub.lat, hub.lng);
              const isSelected = selectedHub?.id === hub.id;

              return (
                <g
                  key={hub.id}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedHub(hub);
                    if (onSelectHub) onSelectHub(hub);
                  }}
                >
                  {/* Pulsing Target Radar Ring */}
                  <circle
                    r={isSelected ? "20" : "13"}
                    fill="none"
                    stroke={isSelected ? "#FF6B00" : "#00F2FE"}
                    strokeWidth="1.6"
                    opacity={isSelected ? "0.9" : "0.5"}
                  >
                    <animate
                      attributeName="r"
                      values={isSelected ? "14;24;14" : "9;18;9"}
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

                  {/* Core Node Circle */}
                  <circle
                    r={isSelected ? "8" : "6"}
                    fill={isSelected ? "#FF6B00" : "#00F2FE"}
                    stroke="#090D16"
                    strokeWidth="2"
                    filter="url(#hubGlow)"
                  />

                  {/* Hub Label Badge */}
                  <rect
                    x="-42"
                    y="-30"
                    width="84"
                    height="18"
                    rx="5"
                    fill="rgba(9, 13, 22, 0.9)"
                    stroke={isSelected ? "#FF6B00" : "rgba(0, 242, 254, 0.35)"}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="-18"
                    fill="#F4F7FC"
                    fontSize="9.5"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="700"
                    letterSpacing="0.5"
                  >
                    {hub.name.split("/")[0].trim()}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Hover Corridor Metric Card Tooltip */}
      <AnimatePresence>
        {hoveredCorridor && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-16 left-6 z-30 glass-panel-glow px-4 py-3 rounded-xl border border-cyan/40 shadow-2xl pointer-events-none max-w-sm"
          >
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="font-heading font-bold text-xs text-text-primary">
                {hoveredCorridor.name}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  hoveredCorridor.status === "EXPRESS"
                    ? "bg-status-success/20 text-status-success"
                    : hoveredCorridor.status === "DELAY"
                    ? "bg-status-warning/20 text-status-warning"
                    : "bg-cyan/20 text-cyan"
                }`}
              >
                {hoveredCorridor.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] text-text-secondary pt-1 border-t border-border-subtle">
              <div>
                <span className="text-[9px] text-text-muted block">DISTANCE</span>
                <span className="font-mono text-text-primary font-bold">
                  {hoveredCorridor.distanceKm} km
                </span>
              </div>
              <div>
                <span className="text-[9px] text-text-muted block">AVG SPEED</span>
                <span className="font-mono text-cyan font-bold">
                  {hoveredCorridor.avgSpeedKmH} km/h
                </span>
              </div>
              <div>
                <span className="text-[9px] text-text-muted block">ACTIVE FLEET</span>
                <span className="font-mono text-text-primary font-bold">
                  {hoveredCorridor.activeFleet} Units
                </span>
              </div>
            </div>

            {hoveredCorridor.statusReason && (
              <div className="mt-2 text-[10px] text-status-warning flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 shrink-0" />
                <span>{hoveredCorridor.statusReason}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Hub Telemetry Drawer Card */}
      <AnimatePresence>
        {selectedHub && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.96 }}
            className="absolute bottom-5 right-5 z-30 glass-panel-glow p-5 rounded-2xl border border-cyan/40 shadow-2xl max-w-sm w-full"
          >
            <div className="flex items-start justify-between pb-3 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse" />
                  <h4 className="font-heading font-bold text-base text-text-primary">
                    {selectedHub.name}
                  </h4>
                </div>
                <p className="text-xs text-text-secondary mt-0.5">{selectedHub.category}</p>
              </div>
              <button
                onClick={() => setSelectedHub(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-navy-900 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Key Telemetry Bento in Drawer */}
            <div className="grid grid-cols-2 gap-2.5 my-3 text-xs">
              <div className="p-2.5 rounded-xl bg-navy-900/80 border border-border-subtle">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] mb-0.5">
                  <Truck className="w-3 h-3 text-cyan" />
                  <span>ACTIVE FLEET</span>
                </div>
                <div className="font-mono font-bold text-sm text-text-primary">
                  {selectedHub.activeTrucks} Trucks
                </div>
                {selectedHub.activeTrains && (
                  <span className="text-[10px] text-cyan block font-mono">
                    +{selectedHub.activeTrains} DFC Trains
                  </span>
                )}
              </div>

              <div className="p-2.5 rounded-xl bg-navy-900/80 border border-border-subtle">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px] mb-0.5">
                  <Package className="w-3 h-3 text-purple-accent" />
                  <span>WAREHOUSE</span>
                </div>
                <div className="font-mono font-bold text-sm text-text-primary">
                  {selectedHub.warehouseCapacity}% Full
                </div>
                <span className="text-[10px] text-text-muted block">
                  {selectedHub.warehouseSqFt}
                </span>
              </div>
            </div>

            {/* Weather & Traffic Condition */}
            <div className="p-2.5 rounded-xl bg-navy-900/60 border border-border-subtle flex items-center justify-between text-xs mb-3">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <CloudSun className="w-3.5 h-3.5 text-status-warning" />
                <span>{selectedHub.weather}</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-success/15 text-status-success border border-status-success/30 font-medium">
                Traffic: {selectedHub.trafficStatus}
              </span>
            </div>

            {/* Recent Live Manifests */}
            <div>
              <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider block mb-1.5">
                Active Corridor Manifests
              </span>
              <div className="space-y-1.5">
                {selectedHub.recentManifests.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg bg-navy-900/50 border border-border-subtle flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-cyan font-semibold">{m.id}</span>
                    <span className="text-text-secondary truncate max-w-[140px] text-[11px]">
                      {m.destination}
                    </span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-navy-850 text-status-success font-mono">
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls & Live Status Legend */}
      <div className="absolute bottom-4 left-4 z-20 flex flex-wrap items-center gap-3 pointer-events-none">
        {/* Route Status Legend */}
        <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-navy-950/85 backdrop-blur-md border border-border-subtle text-[11px] flex items-center gap-4 text-text-secondary shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan" />
            <span>Optimal (NH / GQ)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning" />
            <span>Delay / Monsoon</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success" />
            <span>Express / DFC Rail</span>
          </div>
        </div>
      </div>

      {/* Bottom Right: Zoom & Reset Controls */}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
        <button
          onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 2.5))}
          className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/30 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4 text-cyan" />
        </button>
        <button
          onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.75))}
          className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/30 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4 text-cyan" />
        </button>
        <button
          onClick={resetView}
          className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-border-subtle text-text-secondary hover:text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
          title="Reset India Map View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

