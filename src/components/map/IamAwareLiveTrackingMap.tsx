"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
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
  Info,
  Maximize2,
  ChevronDown,
  ChevronRight,
  Shield,
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
  INDIA_CORRIDORS_DATA,
  INDIA_FLEET_DATA,
  INDIA_FASTAG_TOLLS,
} from "@/lib/maps/india-cartography-data";

import { IndiaGeoWorkerManager } from "@/lib/workers/geojson-worker";

export interface IamAwareMapProps {
  className?: string;
  selectedTrackingId?: string;
  onSelectShipment?: (trackingId: string) => void;
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

export function IamAwareLiveTrackingMap({
  className = "h-[640px]",
  selectedTrackingId,
  onSelectShipment,
}: IamAwareMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const workerManagerRef = useRef<IndiaGeoWorkerManager | null>(null);

  // Layer Visibility State (matching collapsible layer tree)
  const [layersOpen, setLayersOpen] = useState(false);
  const [activeLayers, setActiveLayers] = useState({
    // Administrative
    sovereignBorder: true,
    states: true,
    // Geography & Physical
    rivers: true,
    mountainPasses: true,
    portsAndIcds: true,
    // Nextrak Live Logistics
    liveFleet: true,
    goldenQuad: true,
    dfcRail: true,
    fastagTolls: true,
  });

  // Selected feature inspector drawer
  const [selectedFeature, setSelectedFeature] = useState<{
    type: "SHIPMENT" | "PORT" | "PASS" | "STATE" | "RIVER" | "CORRIDOR";
    title: string;
    subtitle: string;
    properties: Record<string, any>;
  } | null>(null);

  // Floating hover tooltip
  const [hoverTooltip, setHoverTooltip] = useState<{
    x: number;
    y: number;
    title: string;
    subtitle: string;
    badge?: string;
  } | null>(null);

  // Initialize Web Worker Manager
  useEffect(() => {
    workerManagerRef.current = new IndiaGeoWorkerManager();
    return () => {
      workerManagerRef.current?.terminate();
    };
  }, []);

  // Initialize Native MapLibre Canvas
  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;

    async function initMap() {
      if (!isMounted || !mapContainerRef.current) return;

      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      const isLightTheme =
        typeof document !== "undefined" &&
        document.documentElement.getAttribute("data-theme") === "enterprise-light";

      const map = new MapLibreMap({
        container: mapContainerRef.current,
        style: LUMINOUS_INDIA_MAP_STYLE,
        center: [78.9629, 22.5937], // Strictly India Center
        zoom: 4.3,
        minZoom: 3.8,
        maxZoom: 16,
        maxBounds: [
          [65.0, 5.0], // Southwest bounds (Arabian Sea / Kanyakumari)
          [100.0, 38.5], // Northeast bounds (Ladakh / Arunachal Pradesh)
        ],
        attributionControl: false,
      });

      mapRef.current = map;

      map.on("load", () => {
        if (!isMounted) return;

        // Force canvas size computation
        map.resize();

        // Process datasets through worker off-thread in background
        if (workerManagerRef.current) {
          workerManagerRef.current.processDatasets({
            states: INDIA_STATES_DATA,
            rivers: INDIA_RIVERS_DATA,
            corridors: INDIA_CORRIDORS_DATA,
          }).catch((e) => console.warn("Worker preprocessing notice:", e));
        }

        // 1. Sovereign India Border with Tactical Neon Glow
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

        // 2. States and Union Territories Layer
        map.addSource("india-states-src", {
          type: "geojson",
          data: INDIA_STATES_DATA as any,
        });

        map.addLayer({
          id: "india-states-fill",
          type: "fill",
          source: "india-states-src",
          paint: {
            "fill-color": isLightTheme ? "#3B82F6" : "#00D4FF",
            "fill-opacity": 0.06,
          },
        });

        map.addLayer({
          id: "india-states-outline",
          type: "line",
          source: "india-states-src",
          paint: {
            "line-color": isLightTheme ? "#2563EB" : "#1D4ED8",
            "line-width": 1.2,
            "line-opacity": 0.75,
          },
        });

        // 3. Rivers & Inland Waterways Layer (NW-1, NW-2)
        map.addSource("india-rivers-src", {
          type: "geojson",
          data: INDIA_RIVERS_DATA as any,
        });

        map.addLayer({
          id: "india-rivers-line",
          type: "line",
          source: "india-rivers-src",
          paint: {
            "line-color": "#38BDF8",
            "line-width": 2.5,
            "line-opacity": 0.85,
          },
        });

        // 4. Logistics Corridors (Golden Quad & DFC Rail)
        map.addSource("india-corridors-src", {
          type: "geojson",
          data: INDIA_CORRIDORS_DATA as any,
        });

        map.addLayer({
          id: "india-corridors-gq",
          type: "line",
          source: "india-corridors-src",
          filter: ["==", "mode", "Express Road Fleet"],
          paint: {
            "line-color": "#FFB547",
            "line-width": 3,
            "line-opacity": 0.9,
          },
        });

        map.addLayer({
          id: "india-corridors-dfc",
          type: "line",
          source: "india-corridors-src",
          filter: ["!=", "mode", "Express Road Fleet"],
          paint: {
            "line-color": "#20C997",
            "line-width": 3.2,
            "line-dasharray": [4, 2],
            "line-opacity": 0.95,
          },
        });

        // 5. Mountain Passes & Strategic Ghats
        map.addSource("india-passes-src", {
          type: "geojson",
          data: INDIA_PASSES_AND_GHATS as any,
        });

        map.addLayer({
          id: "india-passes-circle",
          type: "circle",
          source: "india-passes-src",
          paint: {
            "circle-radius": 7,
            "circle-color": "#EF4444",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFFFFF",
          },
        });

        // 6. Major Seaports & ICDs
        map.addSource("india-ports-src", {
          type: "geojson",
          data: INDIA_PORTS_AND_ICDS as any,
        });

        map.addLayer({
          id: "india-ports-circle",
          type: "circle",
          source: "india-ports-src",
          paint: {
            "circle-radius": 8,
            "circle-color": "#3B82F6",
            "circle-stroke-width": 2.5,
            "circle-stroke-color": "#FFFFFF",
          },
        });

        // 7. FASTag Toll Plazas
        map.addSource("india-tolls-src", {
          type: "geojson",
          data: INDIA_FASTAG_TOLLS as any,
        });

        map.addLayer({
          id: "india-tolls-circle",
          type: "circle",
          source: "india-tolls-src",
          paint: {
            "circle-radius": 5,
            "circle-color": "#A855F7",
            "circle-stroke-width": 1.5,
            "circle-stroke-color": "#FFFFFF",
          },
        });

        // Render Live Fleet Markers with interactive HTML & pulsers
        renderFleetMarkers(map);

        // Setup Interactive Hover & Click Mechanics
        setupLayerInteractions(map);
      });
    }

    initMap();

    // ResizeObserver ensures canvas always recalculates whenever layout size updates
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(() => {
      if (mapRef.current) mapRef.current.resize();
    }, 150);
    const t2 = setTimeout(() => {
      if (mapRef.current) mapRef.current.resize();
    }, 600);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      resizeObserver.disconnect();
      isMounted = false;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Render Rich HTML Fleet Markers on MapLibre Canvas
  const renderFleetMarkers = (map: MapLibreMap) => {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    INDIA_FLEET_DATA.features.forEach((feature) => {
      const props = feature.properties;
      const coords = feature.geometry.coordinates as [number, number];

      // Custom marker container
      const el = document.createElement("div");
      el.className = "nextrak-fleet-marker cursor-pointer group relative";
      el.style.width = "40px";
      el.style.height = "40px";

      const isAir = props.vehicleModel.includes("Boeing");
      const isRail = props.vehicleModel.includes("Double-Loco");
      const isSea = props.vehicleModel.includes("Coastal Container");
      const isReefer = props.temperature.includes("-18");

      const iconBg = isAir
        ? "bg-purple-600"
        : isRail
        ? "bg-emerald-600"
        : isSea
        ? "bg-blue-600"
        : isReefer
        ? "bg-cyan"
        : "bg-amber-500";

      el.innerHTML = `
        <div class="relative flex items-center justify-center w-full h-full">
          <div class="absolute inset-0 rounded-full ${iconBg} opacity-30 animate-ping"></div>
          <div class="w-8 h-8 rounded-full ${iconBg} border-2 border-white shadow-xl flex items-center justify-center text-white text-xs font-bold transition-transform group-hover:scale-125">
            ${isAir ? "✈" : isRail ? "🚆" : isSea ? "🚢" : "🚛"}
          </div>
          <div class="absolute -bottom-5 bg-slate-900/90 text-[10px] font-mono text-cyan px-1.5 py-0.5 rounded border border-cyan/40 whitespace-nowrap shadow-md pointer-events-none">
            ${props.trackingId}
          </div>
        </div>
      `;

      el.addEventListener("click", () => {
        setSelectedFeature({
          type: "SHIPMENT",
          title: props.trackingId,
          subtitle: `${props.origin} → ${props.destination}`,
          properties: props,
        });

        if (onSelectShipment) {
          onSelectShipment(props.trackingId);
        }

        map.flyTo({
          center: coords,
          zoom: 7.5,
          speed: 1.2,
          curve: 1.4,
          essential: true,
        });
      });

      const marker = new MapLibreMarker({ element: el })
        .setLngLat(coords)
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  // Setup Layer Interactions (Hovers, Clicks, Tooltips)
  const setupLayerInteractions = (map: MapLibreMap) => {
    // States click & hover
    map.on("mousemove", "india-states-fill", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const feat = e.features[0];
        const p = feat.properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: `${p.region} • ${p.activeConsignments} Active Consignments`,
          badge: `Avg Speed: ${p.avgSpeed}`,
        });
      }
    });

    map.on("mouseleave", "india-states-fill", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });

    map.on("click", "india-states-fill", (e) => {
      if (e.features && e.features[0]) {
        const feat = e.features[0];
        const p = feat.properties;
        setSelectedFeature({
          type: "STATE",
          title: p.name,
          subtitle: `${p.capital} (Capital) • ${p.region}`,
          properties: p,
        });
        map.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: 6, duration: 1200 });
      }
    });

    // Seaports click & hover
    map.on("mousemove", "india-ports-circle", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const p = e.features[0].properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: p.type,
          badge: p.capacityTeu,
        });
      }
    });

    map.on("mouseleave", "india-ports-circle", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });

    map.on("click", "india-ports-circle", (e) => {
      if (e.features && e.features[0]) {
        const p = e.features[0].properties;
        setSelectedFeature({
          type: "PORT",
          title: p.name,
          subtitle: p.type,
          properties: p,
        });
        map.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: 9, duration: 1200 });
      }
    });

    // Mountain Passes click & hover
    map.on("mousemove", "india-passes-circle", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const p = e.features[0].properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: p.corridor,
          badge: `Elevation: ${p.elevation}`,
        });
      }
    });

    map.on("mouseleave", "india-passes-circle", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });

    map.on("click", "india-passes-circle", (e) => {
      if (e.features && e.features[0]) {
        const p = e.features[0].properties;
        setSelectedFeature({
          type: "PASS",
          title: p.name,
          subtitle: p.type,
          properties: p,
        });
        map.flyTo({ center: [e.lngLat.lng, e.lngLat.lat], zoom: 8.5, duration: 1200 });
      }
    });

    // Corridors hover
    map.on("mousemove", "india-corridors-gq", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const p = e.features[0].properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: `Distance: ${p.lengthKm} • Active Trucks: ${p.activeTrucks}`,
          badge: p.status,
        });
      }
    });

    map.on("mouseleave", "india-corridors-gq", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });

    // Rivers hover
    map.on("mousemove", "india-rivers-line", (e) => {
      if (e.features && e.features[0]) {
        map.getCanvas().style.cursor = "pointer";
        const p = e.features[0].properties;
        setHoverTooltip({
          x: e.point.x,
          y: e.point.y,
          title: p.name,
          subtitle: p.corridor,
          badge: `Draft: ${p.vesselDraft || "Navigable"}`,
        });
      }
    });

    map.on("mouseleave", "india-rivers-line", () => {
      map.getCanvas().style.cursor = "";
      setHoverTooltip(null);
    });
  };

  // Sync external selection of tracking ID
  useEffect(() => {
    if (!selectedTrackingId || !mapRef.current) return;

    const target = INDIA_FLEET_DATA.features.find(
      (f) => f.properties.trackingId === selectedTrackingId
    );

    if (target) {
      const coords = target.geometry.coordinates as [number, number];
      mapRef.current.flyTo({
        center: coords,
        zoom: 7.5,
        speed: 1.2,
        duration: 1500,
        essential: true,
      });

      setSelectedFeature({
        type: "SHIPMENT",
        title: target.properties.trackingId,
        subtitle: `${target.properties.origin} → ${target.properties.destination}`,
        properties: target.properties,
      });
    }
  }, [selectedTrackingId]);

  // Toggle Layer Visibility dynamically
  const toggleLayer = (layerKey: keyof typeof activeLayers, layerId: string | string[]) => {
    const updated = !activeLayers[layerKey];
    setActiveLayers((prev) => ({ ...prev, [layerKey]: updated }));

    if (!mapRef.current) return;
    const visibility = updated ? "visible" : "none";

    const ids = Array.isArray(layerId) ? layerId : [layerId];
    ids.forEach((id) => {
      if (mapRef.current?.getLayer(id)) {
        mapRef.current.setLayoutProperty(id, "visibility", visibility);
      }
    });

    if (layerKey === "liveFleet") {
      markersRef.current.forEach((m) => {
        const el = m.getElement();
        el.style.display = updated ? "block" : "none";
      });
    }
  };

  // Auto-Frame India button handler
  const handleAutoFrameIndia = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: [78.9629, 22.5937],
      zoom: 4.3,
      bearing: 0,
      pitch: 0,
      duration: 1200,
    });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-border-subtle glass-panel flex flex-col ${className}`}>
      {/* 1. Header Toolbar with Engine Switcher & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-border-subtle bg-slate-900/60 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan animate-pulse" />
            <h2 className="font-heading text-sm font-bold text-text-primary flex items-center gap-1.5">
              <span>NEXTRAK</span>
              <span className="text-cyan font-mono text-xs font-semibold">iamaware.in/map Cartographic Engine</span>
            </h2>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan/10 border border-cyan/20 text-[11px] font-mono text-cyan">
            <Shield className="w-3 h-3" />
            <span>Survey of India Sovereign Boundaries</span>
          </div>
        </div>

        {/* Right Controls: Layer Toggle & Auto-Frame India */}
        <div className="flex items-center gap-2">
          {/* Collapsible Layer Toggle Pill */}
          <button
            onClick={() => setLayersOpen(!layersOpen)}
            className={`px-3 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              layersOpen
                ? "bg-cyan/20 border-cyan text-cyan"
                : "bg-slate-800/80 border-border-subtle text-text-secondary hover:text-text-primary"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Layers</span>
            <ChevronDown className={`w-3 h-3 transition-transform ${layersOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Auto-Frame India Button */}
          <button
            onClick={handleAutoFrameIndia}
            title="Reset / Auto-Frame India Camera Bounds"
            className="p-1.5 rounded-lg bg-slate-800/80 border border-border-subtle text-text-secondary hover:text-cyan transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. Main 100% Native WebGL Map Canvas Container (Zero Iframes, Zero Carto CDN) */}
      <div className="relative flex-1 w-full min-h-[480px]">
        {/* Native MapLibre Canvas Container */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

            {/* Floating Hover Tooltip */}
            {hoverTooltip && (
              <div
                style={{ left: hoverTooltip.x + 12, top: hoverTooltip.y + 12 }}
                className="absolute z-30 pointer-events-none px-2.5 py-1.5 rounded-lg bg-slate-900/95 border border-cyan/40 shadow-2xl backdrop-blur-md max-w-xs transition-transform"
              >
                <div className="text-xs font-bold text-text-primary">{hoverTooltip.title}</div>
                <div className="text-[11px] text-text-secondary">{hoverTooltip.subtitle}</div>
                {hoverTooltip.badge && (
                  <div className="text-[10px] font-mono text-cyan mt-0.5">{hoverTooltip.badge}</div>
                )}
              </div>
            )}

            {/* Collapsible "View" Layer Tree Control Panel */}
            {layersOpen && (
              <div className="absolute top-3 left-3 z-30 w-72 rounded-xl bg-slate-950/90 border border-border-subtle p-3 shadow-2xl backdrop-blur-md space-y-3 max-h-[85%] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between border-b border-border-subtle pb-2">
                  <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-cyan" />
                    <span>iamaware.in Layer Controller</span>
                  </div>
                  <button
                    onClick={() => setLayersOpen(false)}
                    className="text-text-muted hover:text-text-primary"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Layer Group A: Administrative & Sovereign */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-mono uppercase text-cyan font-semibold tracking-wider">
                    Administrative & Sovereign
                  </div>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan" />
                      <span>Official Sovereign Boundary</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.sovereignBorder}
                      onChange={() =>
                        toggleLayer("sovereignBorder", [
                          "sovereign-border-line",
                          "sovereign-border-fill",
                        ])
                      }
                      className="rounded accent-cyan"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>28 States & 8 UT Boundaries</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.states}
                      onChange={() =>
                        toggleLayer("states", ["india-states-fill", "india-states-outline"])
                      }
                      className="rounded accent-cyan"
                    />
                  </label>
                </div>

                {/* Layer Group B: Physical & Infrastructure */}
                <div className="space-y-1.5 border-t border-border-subtle pt-2">
                  <div className="text-[11px] font-mono uppercase text-cyan font-semibold tracking-wider">
                    Physical & Geography
                  </div>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <Waves className="w-3 h-3 text-sky-400" />
                      <span>Major Rivers (NW-1, NW-2)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.rivers}
                      onChange={() => toggleLayer("rivers", "india-rivers-line")}
                      className="rounded accent-cyan"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <Mountain className="w-3 h-3 text-red-400" />
                      <span>Mountain Passes & Ghats</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.mountainPasses}
                      onChange={() => toggleLayer("mountainPasses", "india-passes-circle")}
                      className="rounded accent-cyan"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <Anchor className="w-3 h-3 text-blue-400" />
                      <span>Major Seaports & ICDs</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.portsAndIcds}
                      onChange={() => toggleLayer("portsAndIcds", "india-ports-circle")}
                      className="rounded accent-cyan"
                    />
                  </label>
                </div>

                {/* Layer Group C: Nextrak Live Logistics */}
                <div className="space-y-1.5 border-t border-border-subtle pt-2">
                  <div className="text-[11px] font-mono uppercase text-cyan font-semibold tracking-wider">
                    Nextrak Live Telemetry
                  </div>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3 h-3 text-amber-400" />
                      <span>Live Shipments & Trucks</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.liveFleet}
                      onChange={() => toggleLayer("liveFleet", [])}
                      className="rounded accent-cyan"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Golden Quadrilateral (GQ)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.goldenQuad}
                      onChange={() => toggleLayer("goldenQuad", "india-corridors-gq")}
                      className="rounded accent-cyan"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <Train className="w-3 h-3 text-emerald-400" />
                      <span>Dedicated Freight Corridors (DFC)</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.dfcRail}
                      onChange={() => toggleLayer("dfcRail", "india-corridors-dfc")}
                      className="rounded accent-cyan"
                    />
                  </label>
                  <label className="flex items-center justify-between text-xs text-text-secondary cursor-pointer hover:text-text-primary">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      <span>FASTag Toll Plazas</span>
                    </span>
                    <input
                      type="checkbox"
                      checked={activeLayers.fastagTolls}
                      onChange={() => toggleLayer("fastagTolls", "india-tolls-circle")}
                      className="rounded accent-cyan"
                    />
                  </label>
                </div>
              </div>
            )}

        {/* 3. Bottom-Right Feature Inspector Telemetry Drawer */}
        {selectedFeature && (
          <div className="absolute bottom-4 right-4 z-30 w-84 max-w-[92vw] rounded-xl bg-slate-950/95 border border-cyan/40 p-4 shadow-2xl backdrop-blur-md space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan/15 text-cyan font-semibold">
                  {selectedFeature.type === "SHIPMENT"
                    ? "LIVE VEHICLE TELEMETRY"
                    : selectedFeature.type === "PORT"
                    ? "MARITIME PORT & ICD"
                    : selectedFeature.type === "PASS"
                    ? "STRATEGIC GHAT BOTTLENECK"
                    : "GEOPOLITICAL BOUNDARY"}
                </span>
                <h3 className="font-heading text-sm font-bold text-text-primary mt-1">
                  {selectedFeature.title}
                </h3>
                <p className="text-xs text-text-secondary">{selectedFeature.subtitle}</p>
              </div>
              <button
                onClick={() => setSelectedFeature(null)}
                className="text-text-muted hover:text-text-primary p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Dynamic Attributes based on Feature Type */}
            {selectedFeature.type === "SHIPMENT" && (
              <div className="space-y-2 pt-1 border-t border-border-subtle text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-border-subtle">
                    <span className="text-[10px] text-text-muted block">VEHICLE / ASSET</span>
                    <span className="font-mono text-text-primary font-medium text-[11px]">
                      {selectedFeature.properties.vehicleModel}
                    </span>
                    <span className="text-[10px] text-cyan block font-mono">
                      {selectedFeature.properties.vehicleReg}
                    </span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-border-subtle">
                    <span className="text-[10px] text-text-muted block">DRIVER / PILOT</span>
                    <span className="text-text-primary font-medium text-[11px]">
                      {selectedFeature.properties.driver}
                    </span>
                    <span className="text-[10px] text-emerald-400 block font-mono">
                      Speed: {selectedFeature.properties.speed}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2 rounded-lg border border-border-subtle flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-text-muted block">TEMPERATURE STATUS</span>
                    <span className="text-[11px] font-mono text-cyan">
                      {selectedFeature.properties.temperature}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-muted block">ESTIMATED ARRIVAL</span>
                    <span className="text-[11px] font-mono text-amber-400 font-bold">
                      ETA: {selectedFeature.properties.eta}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-text-secondary bg-slate-900/50 p-2 rounded border border-border-subtle">
                  <span className="font-semibold text-text-primary block mb-0.5">Manifest & E-Way Bill:</span>
                  <div className="font-mono text-[10px] text-cyan">{selectedFeature.properties.eWayBill}</div>
                  <div className="text-[10px] text-text-muted">{selectedFeature.properties.cargo}</div>
                </div>

                <Link
                  href={`/track/${selectedFeature.properties.trackingId}`}
                  className="w-full py-1.5 rounded-lg bg-cyan text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-cyan-glow transition-all"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Open Full Consignment File</span>
                </Link>
              </div>
            )}

            {selectedFeature.type === "PORT" && (
              <div className="space-y-1.5 pt-1 border-t border-border-subtle text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Port Code:</span>
                  <span className="font-mono text-cyan">{selectedFeature.properties.code}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Annual Capacity:</span>
                  <span className="font-mono text-text-primary">{selectedFeature.properties.capacityTeu}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Berths Active:</span>
                  <span className="font-mono text-text-primary">{selectedFeature.properties.berths} Berths</span>
                </div>
                <div className="text-[11px] text-emerald-400 bg-slate-900/60 p-2 rounded">
                  {selectedFeature.properties.status}
                </div>
              </div>
            )}

            {selectedFeature.type === "PASS" && (
              <div className="space-y-1.5 pt-1 border-t border-border-subtle text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Elevation:</span>
                  <span className="font-mono text-amber-400">{selectedFeature.properties.elevation}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Corridor:</span>
                  <span className="font-mono text-text-primary">{selectedFeature.properties.corridor}</span>
                </div>
                <div className="text-[11px] text-red-300 bg-red-950/40 border border-red-900/50 p-2 rounded">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-red-400" />
                  {selectedFeature.properties.transitDelayIndex}
                </div>
              </div>
            )}

            {selectedFeature.type === "STATE" && (
              <div className="space-y-1.5 pt-1 border-t border-border-subtle text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Active Consignments:</span>
                  <span className="font-mono text-cyan">{selectedFeature.properties.activeConsignments}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-text-muted">Average Fleet Speed:</span>
                  <span className="font-mono text-text-primary">{selectedFeature.properties.avgSpeed}</span>
                </div>
                <div className="text-[11px] text-text-secondary bg-slate-900/60 p-2 rounded">
                  {selectedFeature.properties.hubStatus}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Footer Telemetry Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-t border-border-subtle bg-slate-950/70 text-xs font-mono text-text-muted">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Golden Quad (GQ): Optimal Flow</span>
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan" />
            <span>WDFC & EDFC Rail: 95 km/h</span>
          </span>
        </div>
        <div>
          <span>Camera Bound: India Subcontinent (7.5°N - 37.5°N, 67.5°E - 97.5°E)</span>
        </div>
      </div>
    </div>
  );
}

