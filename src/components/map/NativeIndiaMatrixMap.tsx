"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
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
  Thermometer,
  CloudSun,
  Package,
  Activity,
  X,
  FileText,
  AlertTriangle,
  Anchor,
  Mountain,
  Waves,
  MapPin,
  ExternalLink,
  ChevronRight,
  Shield,
  Gauge,
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
  getNodeDisplay,
  NodeDisplayInfo,
  getNodeTier,
} from "@/lib/maps/india-cartography-data";

import {
  MATRIX_CORRIDORS_GEOJSON,
  INDIA_DISTRICTS_DATA,
  IndiaHubMetric,
} from "@/components/map/IndiaMatrixMapLibre";

export interface NativeIndiaMapProps {
  className?: string;
  selectedTrackingId?: string | null;
  onSelectHub?: (hub: IndiaHubMetric) => void;
  onSelectCorridor?: (corridor: any) => void;
}

// High-Luminance Tactical Map Engine (Illuminated Sapphire-Navy Basemap, Zero Carto CDN, Zero Watermarks)
const LUMINOUS_INDIA_MAP_STYLE: any = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "osm-luminous-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors • Survey of India Sovereign Boundaries",
    },
  },
  layers: [
    {
      id: "canvas-background",
      type: "background",
      paint: {
        "background-color": "#0D1B33", // Rich illuminated sapphire-navy (replaces pitch-black #070B14)
      },
    },
    {
      id: "osm-luminous-raster",
      type: "raster",
      source: "osm-luminous-tiles",
      paint: {
        "raster-opacity": 0.88,        // High visibility for terrain, highways, and coastlines
        "raster-brightness-min": 0.24, // Lifts dark shadows so the map is never muddy
        "raster-brightness-max": 0.96, // Crisp, bright landmass illumination
        "raster-saturation": -0.22,    // Retains subtle natural geographic color
        "raster-contrast": 0.28,       // Sharp coastal and state definition
        "raster-fade-duration": 200,
      },
    },
  ],
};

export function NativeIndiaMatrixMap({
  className = "h-[620px]",
  selectedTrackingId,
  onSelectHub,
  onSelectCorridor,
}: NativeIndiaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const hubMarkersRef = useRef<MapLibreMarker[]>([]);
  const tieredMarkersRef = useRef<
    Array<{
      el: HTMLElement;
      tier: 1 | 2 | 3;
      isModeRelevant: boolean;
    }>
  >([]);

  // Filter Pills: "ALL" | "RAIL_DFC" | "ROAD" | "AIR" | "COLD_CHAIN"
  const [activeFilter, setActiveFilter] = useState<"ALL" | "RAIL_DFC" | "ROAD" | "AIR" | "COLD_CHAIN">("ALL");

  // Selected Node for detailed floating telemetry drawer
  const [selectedNode, setSelectedNode] = useState<LogisticsNode | null>(null);

  // Floating hover tooltip
  const [hoverTooltip, setHoverTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
    metric?: string;
    badge?: string;
  } | null>(null);

  // Helper: adapt LogisticsNode to legacy IndiaHubMetric for external callbacks
  const adaptNodeToHub = (node: LogisticsNode): IndiaHubMetric => ({
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
  });

  // Continental LOD: Define primary nodes for each mode so secondary markers show dot-only at continental zoom (<5.5)
  const PRIMARY_CODES_BY_FILTER: Record<string, Set<string>> = {
    ALL: new Set(["DEL", "BOM", "BLR", "CCU", "HYD", "MAA", "AMD", "GAU"]),
    COLD_CHAIN: new Set(["DEL", "HYD", "BOM", "BLR", "AMD", "CCU", "GAU"]),
    RAIL_DFC: new Set(["NDDT", "SAU", "JNPT", "DKAE", "DDU", "RE"]),
    AIR: new Set(["DEL", "BOM", "BLR", "HYD", "CCU", "MAA", "GAU"]),
    ROAD: new Set(["DEL", "BOM", "BLR", "CCU", "HYD", "MAA", "AMD", "GAU"]),
  };

  // Zoom-Tiered Marker Visibility (Tier 1: >=3.5, Tier 2: >=5.0, Tier 3: >=6.0)
  const updateMarkersVisibility = useCallback((zoom: number) => {
    tieredMarkersRef.current.forEach(({ el, tier, isModeRelevant }) => {
      if (!isModeRelevant) {
        el.style.opacity = "0.2";
        el.style.pointerEvents = "none";
        return;
      }
      let visible = false;
      if (tier === 1 && zoom >= 3.5) visible = true;
      else if (tier === 2 && zoom >= 5.0) visible = true;
      else if (tier === 3 && zoom >= 6.0) visible = true;

      if (visible) {
        el.style.opacity = "1";
        el.style.pointerEvents = "auto";
        el.style.transform = "scale(1)";
        el.style.display = "flex";
      } else {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        el.style.transform = "scale(0.7)";
        el.style.display = "none";
      }
    });
  }, []);

  // Render context-aware dynamic markers for all 23 nodes with Two-Tier architecture & LOD
  const renderHubMarkers = useCallback(
    (map: MapLibreMap, filter: "ALL" | "RAIL_DFC" | "ROAD" | "AIR" | "COLD_CHAIN") => {
      hubMarkersRef.current.forEach((m) => m.remove());
      hubMarkersRef.current = [];
      tieredMarkersRef.current = [];

      LOGISTICS_NODES.forEach((node) => {
        const display: NodeDisplayInfo = getNodeDisplay(node, filter);
        const tier = getNodeTier(display.badgeCode || node.city.code);

        // Determine mode relevance and LOD classification
        let isModeRelevant = true;
        let isSecondary = false;

        const primarySet = PRIMARY_CODES_BY_FILTER[filter] || PRIMARY_CODES_BY_FILTER.ALL;

        if (filter === "ALL") {
          isSecondary = !primarySet.has(node.city.code);
        } else if (filter === "RAIL_DFC") {
          isModeRelevant = node.rail !== undefined;
          isSecondary = !primarySet.has(node.rail?.stationCode || "");
        } else if (filter === "AIR") {
          isModeRelevant = node.air !== undefined;
          isSecondary = !primarySet.has(node.air?.iataCode || "");
        } else if (filter === "COLD_CHAIN") {
          isModeRelevant = node.modes.includes("COLD_CHAIN");
          isSecondary = !primarySet.has(node.city.code);
        } else if (filter === "ROAD") {
          isSecondary = !primarySet.has(node.city.code);
        }

        const el = document.createElement("div");
        el.className = `nextrak-marker-anchor group cursor-pointer relative flex items-center justify-center w-5 h-5 ${
          isSecondary ? "marker-secondary" : "marker-primary"
        }`;
        el.style.zIndex = isModeRelevant ? (isSecondary ? "12" : "25") : "2";
        el.style.opacity = isModeRelevant ? "1" : "0.2";
        el.style.pointerEvents = isModeRelevant ? "auto" : "none";
        el.style.transition = "opacity 0.25s ease, transform 0.2s ease";

        // Compact Floating Code Badge (Positioned strictly ABOVE the Pinpoint Dot with margin)
        const badgeHtml = `
          <div class="marker-badge absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider whitespace-nowrap border shadow-lg shadow-black/80 backdrop-blur-md transition-all duration-200 group-hover:scale-110 group-hover:border-white pointer-events-none group-hover:pointer-events-auto z-30 flex items-center" style="border-color: ${display.accentColor}90; box-shadow: 0 4px 12px rgba(0,0,0,0.65);">
            <span style="color: ${display.accentColor}; font-weight: 800; font-family: monospace;">${display.badgeCode}</span>
            <span class="hidden group-hover:inline ml-1 font-normal text-slate-200 font-sans">
              • ${display.displayName}
            </span>
          </div>
        `;

        // Exact Coordinate Radar Anchor (Concentric Outer Pulse + Solid Center Dot)
        const pingHalo = isModeRelevant
          ? `<span class="absolute inset-0 rounded-full animate-ping opacity-60 pointer-events-none" style="background-color: ${display.accentColor};"></span>`
          : "";

        const anchorHtml = `
          ${pingHalo}
          <span class="relative w-2.5 h-2.5 rounded-full border border-slate-950 shadow-sm" style="background-color: ${display.accentColor};"></span>
        `;

        el.innerHTML = badgeHtml + anchorHtml;

        el.addEventListener("mouseenter", () => {
          el.style.zIndex = "60";
          const point = map.project(node.coordinates);
          setHoverTooltip({
            x: point.x,
            y: point.y,
            title: `[${display.badgeCode}] • ${display.displayName}`,
            subtitle: `${display.subLabel} • ${node.city.state}`,
            metric: display.secondaryInfo,
            badge: `${node.telemetry.status === "OPTIMAL" ? "Optimal Flow" : node.telemetry.status.replace(/_/g, " ")} • ${node.telemetry.throughputTEU}`,
          });
        });

        el.addEventListener("mouseleave", () => {
          el.style.zIndex = isModeRelevant ? (isSecondary ? "12" : "25") : "2";
          setHoverTooltip(null);
        });

        el.addEventListener("click", () => {
          setSelectedNode(node);
          const adapted = adaptNodeToHub(node);
          if (onSelectHub) onSelectHub(adapted);

          map.flyTo({
            center: node.coordinates,
            zoom: 7.5,
            speed: 1.2,
            curve: 1.4,
            essential: true,
          });
        });

        const marker = new MapLibreMarker({ element: el })
          .setLngLat(node.coordinates)
          .addTo(map);

        hubMarkersRef.current.push(marker);
        tieredMarkersRef.current.push({ el, tier, isModeRelevant });
      });

      updateMarkersVisibility(map.getZoom());
    },
    [onSelectHub, updateMarkersVisibility]
  );

  // Initialize Native WebGL MapLibre Canvas
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: LUMINOUS_INDIA_MAP_STYLE,
      center: [78.9629, 21.8], // Optimized pan-India centroid with breathing room for North and South
      zoom: 4.15,
      minZoom: 3.6,
      maxZoom: 16,
      maxBounds: [
        [64.0, 4.0], // Southwest bounds (Indian Ocean / Lakshadweep)
        [102.0, 39.0], // Northeast bounds (Trans-Himalayan Karakoram / Arunachal)
      ],
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (!isMounted) return;

      map.resize();

      // 1. Sovereign External Boundary
      map.addSource("sovereign-border-src", {
        type: "geojson",
        data: INDIA_SOVEREIGN_OUTLINE as any,
      });

      map.addLayer({
        id: "sovereign-border-fill",
        type: "fill",
        source: "sovereign-border-src",
        paint: {
          "fill-color": "#00F2FE",
          "fill-opacity": 0.04, // Subtle luminous atmospheric highlight over India landmass
        },
      });

      map.addLayer({
        id: "sovereign-border-glow",
        type: "line",
        source: "sovereign-border-src",
        paint: {
          "line-color": "#00F2FE",
          "line-width": 6,
          "line-blur": 3.5,
          "line-opacity": 0.7,
        },
      });

      map.addLayer({
        id: "sovereign-border-line",
        type: "line",
        source: "sovereign-border-src",
        paint: {
          "line-color": "#00F2FE",
          "line-width": 2.2,
          "line-dasharray": [4, 1.5],
        },
      });

      // 2. States & Union Territories
      map.addSource("india-states-src", {
        type: "geojson",
        data: INDIA_STATES_DATA as any,
      });

      map.addLayer({
        id: "india-states-fill",
        type: "fill",
        source: "india-states-src",
        paint: {
          "fill-color": "#00D4FF",
          "fill-opacity": 0.03,
        },
      });

      map.addLayer({
        id: "india-states-outline",
        type: "line",
        source: "india-states-src",
        paint: {
          "line-color": "#1D4ED8", // High-contrast, sharp Royal Blue state boundaries
          "line-width": 1.2,
          "line-opacity": 0.75,
        },
      });

      // 3. District Drill-down Layer (Semantic zoom > 7)
      map.addSource("india-districts-src", {
        type: "geojson",
        data: INDIA_DISTRICTS_DATA as any,
      });

      map.addLayer({
        id: "india-districts-fill",
        type: "fill",
        source: "india-districts-src",
        minzoom: 7,
        paint: {
          "fill-color": "#A855F7",
          "fill-opacity": 0.15,
        },
      });

      map.addLayer({
        id: "india-districts-outline",
        type: "line",
        source: "india-districts-src",
        minzoom: 7,
        paint: {
          "line-color": "#C084FC",
          "line-width": 1.5,
          "line-dasharray": [2, 2],
        },
      });

      // 4. Physical Features: Rivers & Inland Waterways
      map.addSource("india-rivers-src", {
        type: "geojson",
        data: INDIA_RIVERS_DATA as any,
      });

      map.addLayer({
        id: "india-rivers-line",
        type: "line",
        source: "india-rivers-src",
        paint: {
          "line-color": "#0284C7",
          "line-width": 2.4,
          "line-opacity": 0.9,
        },
      });

      // 5. Physical Features: Mountain Passes & Ghats
      map.addSource("india-passes-src", {
        type: "geojson",
        data: INDIA_PASSES_AND_GHATS as any,
      });

      map.addLayer({
        id: "india-passes-circle",
        type: "circle",
        source: "india-passes-src",
        paint: {
          "circle-radius": 6,
          "circle-color": "#EF4444",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      map.addLayer({
        id: "india-ports-circle",
        type: "circle",
        source: "india-ports-src",
        paint: {
          "circle-radius": 7,
          "circle-color": "#0284C7",
          "circle-stroke-width": 2,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      // 7. Nextrak Freight Corridors (High-Visibility Neon Multi-Modal Layers)
      map.addSource("freight-corridors-src", {
        type: "geojson",
        data: MATRIX_CORRIDORS_GEOJSON as any,
      });

      // 7A. Road & Golden Quadrilateral Highways (Neon Cyan / Amber)
      map.addLayer({
        id: "corridors-road-glow",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "ROAD"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["coalesce", ["get", "color"], "#00F0FF"],
          "line-width": 6,
          "line-blur": 2.5,
          "line-opacity": 0.6,
        },
      });

      map.addLayer({
        id: "corridors-road-line",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "ROAD"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": ["coalesce", ["get", "color"], "#00F0FF"],
          "line-width": 3.2,
          "line-opacity": 0.95,
        },
      });

      // 7B. DFC Heavy Rail Corridors (Emerald Green Dashed Tracks)
      map.addLayer({
        id: "corridors-rail-glow",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "RAIL_DFC"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#10B981",
          "line-width": 8,
          "line-blur": 3.5,
          "line-opacity": 0.6,
        },
      });

      map.addLayer({
        id: "corridors-rail-line",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "RAIL_DFC"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#10B981",
          "line-width": 3.5,
          "line-dasharray": [4, 2],
          "line-opacity": 1.0,
        },
      });

      // 7C. Air Cargo Express Trajectories (Sky Blue Arcs)
      map.addLayer({
        id: "corridors-air-glow",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "AIR"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#38BDF8",
          "line-width": 5,
          "line-blur": 2,
          "line-opacity": 0.6,
        },
      });

      map.addLayer({
        id: "corridors-air-line",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "AIR"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#38BDF8",
          "line-width": 2.5,
          "line-dasharray": [3, 2],
          "line-opacity": 0.9,
        },
      });

      // 7D. Cold Chain Deep-Freeze Routes (Purple Neon)
      map.addLayer({
        id: "corridors-cold-glow",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "COLD_CHAIN"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#A855F7",
          "line-width": 7,
          "line-blur": 3,
          "line-opacity": 0.6,
        },
      });

      map.addLayer({
        id: "corridors-cold-line",
        type: "line",
        source: "freight-corridors-src",
        filter: ["==", ["get", "mode"], "COLD_CHAIN"],
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#C084FC",
          "line-width": 3.2,
          "line-dasharray": [2, 1.5],
          "line-opacity": 1.0,
        },
      });

      // Dynamic Zoom LOD (Continental Overview vs Regional Detail)
      const updateLOD = () => {
        if (!mapContainerRef.current) return;
        const zoom = map.getZoom();
        if (zoom < 5.5) {
          mapContainerRef.current.classList.add("zoom-continental");
        } else {
          mapContainerRef.current.classList.remove("zoom-continental");
        }
        updateMarkersVisibility(zoom);
      };

      map.on("zoom", updateLOD);
      updateLOD();

      // Render the 23 logistics nodes with context-aware names
      renderHubMarkers(map, "ALL");

      // Setup Hover & Click Interactions
      setupInteractions(map);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(() => map.resize(), 150);
    const t2 = setTimeout(() => map.resize(), 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      isMounted = false;
      hubMarkersRef.current.forEach((m) => m.remove());
      hubMarkersRef.current = [];
      tieredMarkersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [renderHubMarkers, updateMarkersVisibility]);

  // Interactions setup
  const setupInteractions = (map: MapLibreMap) => {
    const corridorLayers = [
      "corridors-road-line",
      "corridors-rail-line",
      "corridors-air-line",
      "corridors-cold-line",
    ];

    corridorLayers.forEach((layerId) => {
      map.on("mousemove", layerId, (e) => {
        if (e.features && e.features[0]) {
          map.getCanvas().style.cursor = "pointer";
          const p = e.features[0].properties;
          setHoverTooltip({
            x: e.point.x,
            y: e.point.y,
            title: p.name,
            subtitle: `${p.distanceKm} • Avg Speed: ${p.avgSpeed}`,
            metric: `Active Fleet: ${p.activeFleet}`,
            badge: p.statusLabel,
          });
        }
      });

      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
        setHoverTooltip(null);
      });

      map.on("click", layerId, (e) => {
        if (e.features && e.features[0] && onSelectCorridor) {
          onSelectCorridor(e.features[0].properties);
        }
      });
    });

    map.on("mousemove", "india-ports-circle", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const p = e.features[0].properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: p.coastalZone,
          metric: `Annual Throughput: ${p.annualThroughput}`,
          badge: p.type,
        });
      }
    });

    map.on("mouseleave", "india-ports-circle", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });

    map.on("mousemove", "india-passes-circle", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const p = e.features[0].properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: p.corridor,
          metric: `Elevation: ${p.elevation}`,
          badge: p.type,
        });
      }
    });

    map.on("mouseleave", "india-passes-circle", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });
  };

  // Re-render Dynamic Markers & Update WebGL Corridors whenever activeFilter updates
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // 1. Re-render the 23 markers with context-aware naming and LOD
    renderHubMarkers(map, activeFilter);

    // 2. Adjust corridor layer opacities and widths based on activeFilter
    const applyCorridorStyle = (
      lineId: string,
      glowId: string,
      isMatching: boolean,
      defaultWidth: number,
      activeWidth: number
    ) => {
      if (map.getLayer(lineId) && map.getLayer(glowId)) {
        if (activeFilter === "ALL") {
          map.setPaintProperty(lineId, "line-opacity", 0.95);
          map.setPaintProperty(lineId, "line-width", defaultWidth);
          map.setPaintProperty(glowId, "line-opacity", 0.6);
        } else if (isMatching) {
          map.setPaintProperty(lineId, "line-opacity", 1.0);
          map.setPaintProperty(lineId, "line-width", activeWidth);
          map.setPaintProperty(glowId, "line-opacity", 0.85);
        } else {
          // Dim non-active modes
          map.setPaintProperty(lineId, "line-opacity", 0.12);
          map.setPaintProperty(lineId, "line-width", 1.8);
          map.setPaintProperty(glowId, "line-opacity", 0.05);
        }
      }
    };

    applyCorridorStyle("corridors-road-line", "corridors-road-glow", activeFilter === "ROAD", 3.2, 4.4);
    applyCorridorStyle("corridors-rail-line", "corridors-rail-glow", activeFilter === "RAIL_DFC", 3.5, 5.0);
    applyCorridorStyle("corridors-air-line", "corridors-air-glow", activeFilter === "AIR", 2.5, 3.8);
    applyCorridorStyle("corridors-cold-line", "corridors-cold-glow", activeFilter === "COLD_CHAIN", 3.2, 4.5);
  }, [activeFilter, renderHubMarkers]);

  // Zoom and View Controls
  const handleZoomIn = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomIn({ duration: 300 });
  };

  const handleZoomOut = () => {
    if (!mapRef.current) return;
    mapRef.current.zoomOut({ duration: 300 });
  };

  const handleResetView = () => {
    if (!mapRef.current) return;
    setSelectedNode(null);
    mapRef.current.flyTo({
      center: [78.9629, 21.8],
      zoom: 4.15,
      bearing: 0,
      pitch: 0,
      duration: 1000,
    });
  };

  const currentDisplay = selectedNode ? getNodeDisplay(selectedNode, activeFilter) : null;

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* 1. Dedicated Top Header Bar (Outside & Above Map Canvas - Zero Overlap with DEL) */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4 sm:py-3 rounded-2xl bg-navy-950/90 backdrop-blur-md border border-cyan/30 shadow-lg">
        {/* Left Badge: Official Map of India & Native WebGL Engine */}
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse shadow-glow" />
          <span className="font-heading font-bold text-text-primary tracking-wide text-xs sm:text-sm">
            National Medical & Vaccine Cold-Chain Matrix
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30 font-semibold hidden xs:inline-block">
            23 Healthcare Clusters Active
          </span>
        </div>

        {/* Right Filter Pills: DFC Rail vs Air Cargo vs Road Corridors */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-navy-900/80 border border-border-subtle shadow-inner text-xs overflow-x-auto max-w-full">
          {[
            { id: "ALL", label: "All Corridors", icon: Layers },
            { id: "COLD_CHAIN", label: "Pharma Cold Chain (-80°C/-20°C)", icon: Thermometer },
            { id: "RAIL_DFC", label: "DFC Reefer Rail", icon: Train },
            { id: "AIR", label: "Air Medical Lifelines", icon: Plane },
            { id: "ROAD", label: "NH Critical Care Reefers", icon: Truck },
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
                    : "text-text-secondary hover:text-text-primary hover:bg-navy-850"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main 100% Native WebGL Canvas (100% Unobstructed Pan-India View) */}
      <div className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-cyan/30 ${className}`}>
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

        {/* Floating Hover Tooltip */}
        {hoverTooltip && (
          <div
            style={{
              left: Math.min(hoverTooltip.x + 14, 560),
              top: Math.max(hoverTooltip.y - 75, 16),
            }}
            className="absolute z-40 pointer-events-none px-3.5 py-2.5 rounded-xl bg-slate-950/95 border border-cyan/40 shadow-2xl backdrop-blur-md max-w-xs transition-all duration-150"
          >
            <div className="text-xs font-bold text-white font-heading">{hoverTooltip.title}</div>
            <div className="text-[11px] text-slate-300 font-sans mt-0.5">{hoverTooltip.subtitle}</div>
            {hoverTooltip.metric && (
              <div className="text-[11px] font-mono text-cyan mt-1 font-semibold">{hoverTooltip.metric}</div>
            )}
            {hoverTooltip.badge && (
              <div className="mt-1.5 inline-flex items-center px-2 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30 text-[10px] font-mono font-bold">
                {hoverTooltip.badge}
              </div>
            )}
          </div>
        )}

        {/* 3. Floating Node Telemetry Drawer (Opens upon clicking any node) */}
        {selectedNode && currentDisplay && (
          <div className="absolute top-4 right-4 z-30 w-88 max-w-[92vw] rounded-2xl bg-navy-950/95 border border-cyan/50 p-4 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-right-3 duration-200">
            <div className="flex items-start justify-between pb-2 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold border"
                    style={{
                      color: currentDisplay.accentColor,
                      borderColor: `${currentDisplay.accentColor}60`,
                      backgroundColor: `${currentDisplay.accentColor}15`,
                    }}
                  >
                    {activeFilter} MODE NODE
                  </span>
                  <span className="text-[10px] font-mono text-text-muted">
                    {selectedNode.tier}
                  </span>
                </div>
                <h3 className="font-heading text-base font-bold text-text-primary mt-1 flex items-center gap-1.5">
                  <span>{currentDisplay.displayName}</span>
                  <span
                    className="text-xs font-mono font-black"
                    style={{ color: currentDisplay.accentColor }}
                  >
                    [{currentDisplay.badgeCode}]
                  </span>
                </h3>
                <p className="text-xs text-text-secondary">{currentDisplay.category}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-navy-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode-Specific Detailed KPI Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* Card 1: Primary Mode Asset */}
              <div className="p-2.5 rounded-xl bg-navy-900/80 border border-border-subtle space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px]">
                  {activeFilter === "RAIL_DFC" ? (
                    <Train className="w-3 h-3 text-status-success" />
                  ) : activeFilter === "AIR" ? (
                    <Plane className="w-3 h-3 text-sky-400" />
                  ) : activeFilter === "COLD_CHAIN" ? (
                    <Thermometer className="w-3 h-3 text-cyan" />
                  ) : (
                    <Truck className="w-3 h-3 text-cyan" />
                  )}
                  <span className="uppercase font-mono">
                    {activeFilter === "RAIL_DFC"
                      ? "DFC CORRIDOR"
                      : activeFilter === "AIR"
                      ? "IATA AIRPORT"
                      : activeFilter === "COLD_CHAIN"
                      ? "REEFER ZONE"
                      : "HIGHWAY CORRIDOR"}
                  </span>
                </div>

                <div className="font-mono font-bold text-xs text-text-primary truncate">
                  {activeFilter === "RAIL_DFC" && selectedNode.rail
                    ? `${selectedNode.rail.corridor} Freight`
                    : activeFilter === "AIR" && selectedNode.air
                    ? `${selectedNode.air.iataCode} Cargo Apron`
                    : activeFilter === "COLD_CHAIN"
                    ? `-20°C Cryo Reefer`
                    : `${selectedNode.city.code} Surface Hub`}
                </div>
                <span className="text-[10px] text-text-muted block truncate">
                  {activeFilter === "RAIL_DFC" && selectedNode.rail
                    ? selectedNode.rail.yardType
                    : activeFilter === "AIR" && selectedNode.air
                    ? selectedNode.air.terminal
                    : selectedNode.city.state}
                </span>
              </div>

              {/* Card 2: Telemetry Throughput */}
              <div className="p-2.5 rounded-xl bg-navy-900/80 border border-border-subtle space-y-1">
                <div className="flex items-center gap-1.5 text-text-muted text-[10px]">
                  <Gauge className="w-3 h-3 text-cyan" />
                  <span className="uppercase font-mono">
                    {activeFilter === "COLD_CHAIN" ? "COLD STORAGE" : "CAPACITY & GDP"}
                  </span>
                </div>
                <div className="font-mono font-bold text-xs text-text-primary">
                  {selectedNode.coldStorageCapacityPallets
                    ? `${selectedNode.coldStorageCapacityPallets.toLocaleString()} Pallets`
                    : selectedNode.telemetry.throughputTEU}
                </div>
                <span className="text-[10px] text-status-success block font-mono">
                  {selectedNode.complianceRatePercent
                    ? `${selectedNode.complianceRatePercent}% CDSCO GDP SLA`
                    : `Avg ${selectedNode.telemetry.avgSpeedKmh} km/h speed`}
                </span>
              </div>
            </div>

            {/* Connectivity Status Bar */}
            <div className="p-2 rounded-xl bg-navy-900/60 border border-border-subtle flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
                <span>{selectedNode.telemetry.activeConsignments} Consignments Tracking</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-status-success/15 text-status-success border border-status-success/30 font-medium">
                {selectedNode.telemetry.status}
              </span>
            </div>

            {/* Active Corridor Manifests for this Node */}
            <div>
              <span className="text-[10px] font-mono uppercase text-text-muted tracking-wider block mb-1">
                Live Manifests Passing Node
              </span>
              <div className="space-y-1.5">
                {[
                  {
                    id: `IND-${selectedNode.city.code}-901`,
                    dest: "Mumbai JNPT Port Yard [JNPT]",
                    status: "In Transit",
                    badgeColor: "text-status-success bg-status-success/10",
                  },
                  {
                    id: `EXP-${selectedNode.city.code}-412`,
                    dest: "New Dadri Freight Terminal [NDDT]",
                    status: "DFC Cleared",
                    badgeColor: "text-cyan bg-cyan/10",
                  },
                ].map((m) => (
                  <div
                    key={m.id}
                    className="p-1.5 rounded-lg bg-navy-900/60 border border-border-subtle flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-cyan font-bold text-[11px]">{m.id}</span>
                    <span className="text-text-secondary truncate max-w-[140px] text-[10px]">
                      {m.dest}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${m.badgeColor}`}>
                      {m.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 4. Bottom Right: Zoom & Reset Controls */}
        <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1.5">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/30 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-cyan" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/30 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-cyan" />
          </button>
          <button
            onClick={handleResetView}
            className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/30 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
            title="Reset Pan-India View"
          >
            <RotateCcw className="w-4 h-4 text-cyan" />
          </button>
        </div>
      </div>

      {/* 5. Dedicated Bottom Controls & Live Status Legend (Outside & Below Map Canvas - Zero Clipping of BLR / MAA) */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-navy-950/80 backdrop-blur-md border border-border-subtle text-xs text-text-secondary shadow-md">
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan shadow-sm" />
            <span className="font-medium text-slate-300">Optimal (NH / GQ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-warning shadow-sm" />
            <span className="font-medium text-slate-300">Delay / Monsoon</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-status-success shadow-sm" />
            <span className="font-medium text-slate-300">Express / DFC Rail</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-mono text-text-muted">
          <span>LOD Semantic Filtering: Active</span>
          <span>•</span>
          <span>23 Healthcare Hubs</span>
        </div>
      </div>
    </div>
  );
}
