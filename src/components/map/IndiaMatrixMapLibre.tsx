"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Truck,
  Train,
  Plane,
  Ship,
  MapPin,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  CloudSun,
  Package,
  Activity,
  Radio,
  SlidersHorizontal,
  X,
  Gauge,
  Thermometer,
  FileText,
  AlertTriangle,
  Anchor,
  Mountain,
  Waves,
} from "lucide-react";

import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";

import {
  INDIA_SOVEREIGN_OUTLINE,
  INDIA_STATES_DATA,
  INDIA_RIVERS_DATA,
  INDIA_PASSES_AND_GHATS,
  INDIA_PORTS_AND_ICDS,
  LOGISTICS_NODES,
  LogisticsNode,
} from "@/lib/maps/india-cartography-data";

export interface IndiaHubMetric {
  id: string;
  name: string;
  shortCode: string;
  category: string;
  coordinates: [number, number]; // [lng, lat]
  activeTrucks: number;
  activeTrains: number;
  warehouseCapacity: number;
  warehouseSqFt: string;
  weather: string;
  trafficStatus: "Optimal" | "Moderate" | "Congested";
  throughputTeu: string;
  avgTurnaroundHours: number;
  recentManifests: { id: string; destination: string; status: string }[];
}

// 23 Strategic National Logistics Nodes with Exact Geographic Coordinates
export const MATRIX_HUBS: IndiaHubMetric[] = LOGISTICS_NODES.map((node) => ({
  id: node.id,
  name: node.city.name,
  shortCode: node.city.code,
  category: `${node.tier} • ${node.city.type}`,
  coordinates: node.coordinates,
  activeTrucks: Math.max(25, Math.round(node.telemetry.activeConsignments * 0.12)),
  activeTrains: node.rail ? (node.rail.corridor === "WDFC" || node.rail.corridor === "EDFC" ? 18 : 10) : 2,
  warehouseCapacity: Math.min(95, 65 + Math.round(node.telemetry.activeConsignments * 0.015)),
  warehouseSqFt: `${(node.telemetry.activeConsignments * 0.0035 + 1.5).toFixed(1)}M sq.ft`,
  weather: "28°C Clear",
  trafficStatus: node.telemetry.status === "HIGH_DENSITY" ? "Moderate" : "Optimal",
  throughputTeu: node.telemetry.throughputTEU,
  avgTurnaroundHours: node.tier === "PORT" ? 16.5 : node.tier === "METRO" ? 4.8 : 6.2,
  recentManifests: [
    { id: `IND-${node.city.code}-101`, destination: "Mumbai JNPT", status: "In Transit" },
    { id: `EXP-${node.city.code}-802`, destination: "Delhi NCR Hub", status: "Dispatched" },
  ],
}));

// District Level GeoJSON (Reveals on zoom > 7)
export const INDIA_DISTRICTS_DATA = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "dist-del-central",
      properties: { name: "Central Delhi Logistics Zone", state: "Delhi", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.18, 28.62], [77.24, 28.62], [77.24, 28.68], [77.18, 28.68], [77.18, 28.62]]]
      }
    },
    {
      type: "Feature",
      id: "dist-gurgaon",
      properties: { name: "Gurugram Warehousing Cluster", state: "Haryana", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[76.90, 28.38], [77.10, 28.38], [77.10, 28.52], [76.90, 28.52], [76.90, 28.38]]]
      }
    },
    {
      type: "Feature",
      id: "dist-mumbai-sub",
      properties: { name: "Mumbai Suburban & Bhiwandi Belt", state: "Maharashtra", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.78, 19.00], [73.05, 19.00], [73.05, 19.30], [72.78, 19.30], [72.78, 19.00]]]
      }
    },
    {
      type: "Feature",
      id: "dist-raigad-jnpt",
      properties: { name: "Raigad (JNPT / Nhava Sheva)", state: "Maharashtra", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.90, 18.85], [73.15, 18.85], [73.15, 19.05], [72.90, 19.05], [72.90, 18.85]]]
      }
    },
    {
      type: "Feature",
      id: "dist-blr-urban",
      properties: { name: "Bengaluru Urban Logistics Corridor", state: "Karnataka", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[77.45, 12.85], [77.75, 12.85], [77.75, 13.15], [77.45, 13.15], [77.45, 12.85]]]
      }
    },
    {
      type: "Feature",
      id: "dist-chennai-auto",
      properties: { name: "Chennai & Sriperumbudur Auto Belt", state: "Tamil Nadu", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[80.15, 12.95], [80.35, 12.95], [80.35, 13.20], [80.15, 13.20], [80.15, 12.95]]]
      }
    },
    {
      type: "Feature",
      id: "dist-ahmedabad-sanand",
      properties: { name: "Ahmedabad & Sanand Industrial Zone", state: "Gujarat", type: "District" },
      geometry: {
        type: "Polygon",
        coordinates: [[[72.40, 22.90], [72.70, 22.90], [72.70, 23.20], [72.40, 23.20], [72.40, 22.90]]]
      }
    },
  ]
};

// Comprehensive GeoJSON Corridors
export const MATRIX_CORRIDORS_GEOJSON = {
  type: "FeatureCollection",
  features: [
    // 1. Golden Quadrilateral: Delhi - Mumbai (NH-48)
    {
      type: "Feature",
      id: "corr-del-bom",
      properties: {
        id: "c-del-bom",
        name: "Delhi ↔ Mumbai (NH-48 Expressway Corridor)",
        code: "GQ-W1",
        mode: "ROAD",
        status: "DELAY",
        statusLabel: "Delay / Monsoon",
        statusReason: "Bharuch Bridge Maintenance (+25 mins)",
        distanceKm: "1,410 km",
        avgSpeed: "64 km/h",
        activeFleet: "58 Trucks",
        color: "#F59E0B",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.1025, 28.7041], [75.8267, 26.9124], [73.8567, 24.5854],
          [72.5714, 23.0225], [73.1812, 22.3072], [72.9959, 21.7051],
          [72.8777, 19.0760]
        ]
      }
    },
    // 2. Western Dedicated Freight Corridor (DFC Rail)
    {
      type: "Feature",
      id: "corr-wdfc-rail",
      properties: {
        id: "c-wdfc-rail",
        name: "Western DFC (Dadri ↔ JNPT Port Heavy Rail)",
        code: "W-DFC",
        mode: "RAIL_DFC",
        status: "EXPRESS",
        statusLabel: "Express / DFC Rail",
        statusReason: "Double-Stack Container Express On-Time",
        distanceKm: "1,504 km",
        avgSpeed: "78 km/h",
        activeFleet: "22 Rakes",
        color: "#10B981",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.5550, 28.5355], [76.6178, 28.1920], [75.8000, 26.8500],
          [74.2000, 24.8800], [72.4385, 24.1722], [72.5714, 23.0225],
          [73.1812, 22.3072], [72.8777, 19.0760]
        ]
      }
    },
    // 3. Golden Quadrilateral: Mumbai - Bengaluru (NH-48)
    {
      type: "Feature",
      id: "corr-bom-blr",
      properties: {
        id: "c-bom-blr",
        name: "Mumbai ↔ Bengaluru (NH-48 Pune Corridor)",
        code: "GQ-SW",
        mode: "ROAD",
        status: "OPTIMAL",
        statusLabel: "Optimal (NH / GQ)",
        statusReason: "Smooth Flow across Western Ghats",
        distanceKm: "984 km",
        avgSpeed: "68 km/h",
        activeFleet: "44 Trucks",
        color: "#00F0FF",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [72.8777, 19.0760], [73.8567, 18.5204], [74.2433, 16.7050],
          [75.1240, 15.3647], [77.5946, 12.9716]
        ]
      }
    },
    // 4. Bengaluru - Chennai Expressway
    {
      type: "Feature",
      id: "corr-blr-maa",
      properties: {
        id: "c-blr-maa",
        name: "Bengaluru ↔ Chennai Port Expressway",
        code: "GQ-S1",
        mode: "ROAD",
        status: "OPTIMAL",
        statusLabel: "Optimal (NH / GQ)",
        statusReason: "High-Speed Access Controlled",
        distanceKm: "348 km",
        avgSpeed: "76 km/h",
        activeFleet: "62 Trucks",
        color: "#00F0FF",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.5946, 12.9716], [78.9000, 12.9200], [80.2707, 13.0827]
        ]
      }
    },
    // 5. Golden Quadrilateral: Chennai - Kolkata (NH-16 Coastal)
    {
      type: "Feature",
      id: "corr-maa-ccu",
      properties: {
        id: "c-maa-ccu",
        name: "Chennai ↔ Kolkata Coastal Corridor (NH-16)",
        code: "GQ-E1",
        mode: "ROAD",
        status: "OPTIMAL",
        statusLabel: "Optimal (NH / GQ)",
        statusReason: "Coastal Multi-Axle Logistics Nominal",
        distanceKm: "1,660 km",
        avgSpeed: "62 km/h",
        activeFleet: "39 Trucks",
        color: "#00F0FF",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [80.2707, 13.0827], [80.6480, 16.5062], [83.2185, 17.6868],
          [85.8245, 20.2961], [88.3639, 22.5726]
        ]
      }
    },
    // 6. Golden Quadrilateral: Kolkata - Delhi (NH-19 Grand Trunk)
    {
      type: "Feature",
      id: "corr-ccu-del",
      properties: {
        id: "c-ccu-del",
        name: "Kolkata ↔ Delhi Grand Trunk Corridor (NH-19)",
        code: "GQ-N1",
        mode: "ROAD",
        status: "OPTIMAL",
        statusLabel: "Optimal (NH / GQ)",
        statusReason: "Grand Trunk Multi-Modal High Density",
        distanceKm: "1,490 km",
        avgSpeed: "65 km/h",
        activeFleet: "52 Trucks",
        color: "#00F0FF",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [88.3639, 22.5726], [85.3096, 23.3441], [83.1167, 25.2833],
          [80.3319, 26.4499], [78.0081, 27.1767], [77.1025, 28.7041]
        ]
      }
    },
    // 7. Eastern Dedicated Freight Corridor (EDFC Rail)
    {
      type: "Feature",
      id: "corr-edfc-rail",
      properties: {
        id: "c-edfc-rail",
        name: "Eastern DFC (Ludhiana ↔ Dankuni Heavy Freight Rail)",
        code: "E-DFC",
        mode: "RAIL_DFC",
        status: "EXPRESS",
        statusLabel: "Express / DFC Rail",
        statusReason: "Electrified Coal & Finished Goods Heavy Rail",
        distanceKm: "1,875 km",
        avgSpeed: "85 km/h",
        activeFleet: "28 Rakes",
        color: "#10B981",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [75.8573, 30.9010], [77.8500, 28.2500], [80.3319, 26.4499],
          [81.8463, 25.4358], [83.1167, 25.2833], [84.3000, 24.8000],
          [88.3639, 22.5726]
        ]
      }
    },
    // 8. North-South Logistics Highway (NH-44 Corridor)
    {
      type: "Feature",
      id: "corr-nh44-ns",
      properties: {
        id: "c-nh44-ns",
        name: "NH-44 North-South Logistics Spine (Delhi ↔ Bengaluru)",
        code: "NH-44",
        mode: "ROAD",
        status: "OPTIMAL",
        statusLabel: "Optimal (NH / GQ)",
        statusReason: "Central Freight Artery Flow Nominal",
        distanceKm: "2,150 km",
        avgSpeed: "67 km/h",
        activeFleet: "76 Trucks",
        color: "#00F0FF",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.1025, 28.7041], [78.0081, 27.1767], [78.5685, 25.4484],
          [79.0882, 21.1458], [78.4867, 17.3850], [77.5946, 12.9716]
        ]
      }
    },
    // 9. Air Cargo Express: BLR ✈ DEL
    {
      type: "Feature",
      id: "corr-air-blr-del",
      properties: {
        id: "c-air-blr-del",
        name: "BLR ✈ DEL Air Cargo Express Corridor",
        code: "AIR-01",
        mode: "AIR",
        status: "EXPRESS",
        statusLabel: "Air Cargo Express",
        statusReason: "Direct A321 / B737 Freighter In-Flight",
        distanceKm: "1,740 km",
        avgSpeed: "720 km/h",
        activeFleet: "14 Flights",
        color: "#38BDF8",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.5946, 12.9716], [78.2000, 19.5000], [77.1025, 28.7041]
        ]
      }
    },
    // 10. Air Cargo Express: DEL ✈ BOM
    {
      type: "Feature",
      id: "corr-air-del-bom",
      properties: {
        id: "c-air-del-bom",
        name: "DEL ✈ BOM Air Cargo Express Shuttle",
        code: "AIR-02",
        mode: "AIR",
        status: "EXPRESS",
        statusLabel: "Air Cargo Express",
        statusReason: "High-Frequency Metro Air Shuttle Nominal",
        distanceKm: "1,150 km",
        avgSpeed: "710 km/h",
        activeFleet: "18 Flights",
        color: "#38BDF8",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.1025, 28.7041], [74.8000, 24.2000], [72.8777, 19.0760]
        ]
      }
    },
    // 11. Air Cargo Express: BOM ✈ CCU
    {
      type: "Feature",
      id: "corr-air-bom-ccu",
      properties: {
        id: "c-air-bom-ccu",
        name: "BOM ✈ CCU East-West Air Freight Link",
        code: "AIR-03",
        mode: "AIR",
        status: "EXPRESS",
        statusLabel: "Air Cargo Express",
        statusReason: "Heavy Industrial Air Cargo Operations",
        distanceKm: "1,670 km",
        avgSpeed: "730 km/h",
        activeFleet: "11 Flights",
        color: "#38BDF8",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [72.8777, 19.0760], [80.5000, 21.2000], [88.3639, 22.5726]
        ]
      }
    },
    // 12. Air Cargo Express: DEL ✈ GAU (North-East Lifeline)
    {
      type: "Feature",
      id: "corr-air-del-gau",
      properties: {
        id: "c-air-del-gau",
        name: "DEL ✈ GAU North-East Express Air Lifeline",
        code: "AIR-04",
        mode: "AIR",
        status: "EXPRESS",
        statusLabel: "Air Cargo Express",
        statusReason: "Express Medical & Perishable Air Supply",
        distanceKm: "1,460 km",
        avgSpeed: "690 km/h",
        activeFleet: "8 Flights",
        color: "#38BDF8",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [77.1025, 28.7041], [84.5000, 27.5000], [91.7362, 26.1445]
        ]
      }
    },
    // 13. Cold Chain Pharma: Hyderabad ↔ Mumbai JNPT
    {
      type: "Feature",
      id: "corr-cold-hyd-bom",
      properties: {
        id: "c-cold-hyd-bom",
        name: "Hyderabad Genome Valley ↔ Mumbai JNPT (Cold Chain)",
        code: "COLD-PHARMA-1",
        mode: "COLD_CHAIN",
        status: "EXPRESS",
        statusLabel: "Cold Chain (-20°C)",
        statusReason: "Active Temperature Logging (-20°C Verified)",
        distanceKm: "710 km",
        avgSpeed: "60 km/h",
        activeFleet: "32 Reefers",
        color: "#C084FC",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [78.4867, 17.3850], [75.5000, 18.2000], [72.8777, 19.0760]
        ]
      }
    },
    // 14. Cold Chain Pharma: Nagpur Zero-Mile ↔ Hyderabad
    {
      type: "Feature",
      id: "corr-cold-nag-hyd",
      properties: {
        id: "c-cold-nag-hyd",
        name: "Nagpur Central Hub ↔ Hyderabad Biotech Cluster",
        code: "COLD-PHARMA-2",
        mode: "COLD_CHAIN",
        status: "EXPRESS",
        statusLabel: "Cold Chain (-20°C)",
        statusReason: "Continuous Cryogenic Vaccine Monitoring",
        distanceKm: "500 km",
        avgSpeed: "62 km/h",
        activeFleet: "24 Reefers",
        color: "#C084FC",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [79.0882, 21.1458], [78.4867, 17.3850]
        ]
      }
    },
    // 15. Siliguri Chicken's Neck ↔ Guwahati (Monsoon / Delay)
    {
      type: "Feature",
      id: "corr-siliguri-gau",
      properties: {
        id: "c-ccu-gau",
        name: "Siliguri Chicken's Neck ↔ Guwahati Gateway",
        code: "NE-COR",
        mode: "ROAD",
        status: "DELAY",
        statusLabel: "Delay / Monsoon",
        statusReason: "Monsoon Landslide Risk & Checkpost Inspection",
        distanceKm: "990 km",
        avgSpeed: "52 km/h",
        activeFleet: "28 Trucks",
        color: "#F59E0B",
      },
      geometry: {
        type: "LineString",
        coordinates: [
          [88.3639, 22.5726], [88.4312, 26.7271], [91.7362, 26.1445]
        ]
      }
    }
  ]
};

export type { NativeIndiaMapProps as IndiaMatrixMapProps } from "./NativeIndiaMatrixMap";
export { NativeIndiaMatrixMap as IndiaMatrixMapLibre } from "./NativeIndiaMatrixMap";
