"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "maplibre-gl/dist/maplibre-gl.css";
import { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import {
  Compass,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Truck,
  MapPin,
  Thermometer,
  Shield,
  Activity,
  Maximize2,
  Eye,
  Sparkles,
} from "lucide-react";

export interface ShipmentVisualizerProps {
  trackingNumber: string;
  carrier?: string;
  serviceType?: string;
  status: string;
  originCity: string;
  originLat: number;
  originLng: number;
  destinationCity: string;
  destinationLat: number;
  destinationLng: number;
  currentLat?: number | null;
  currentLng?: number | null;
  temperature?: string;
  weightKg?: number;
  className?: string;
}

// Tactical 3D Illuminated Map Style
const LUMINOUS_INDIA_MAP_STYLE: any = {
  version: 8,
  glyphs: "https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf",
  sources: {
    "osm-luminous-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors, Survey of India Boundaries",
    },
  },
  layers: [
    {
      id: "canvas-background",
      type: "background",
      paint: { "background-color": "#0D1B33" }, // Luminous sapphire navy
    },
    {
      id: "osm-luminous-raster",
      type: "raster",
      source: "osm-luminous-tiles",
      paint: {
        "raster-opacity": 0.88,
        "raster-brightness-min": 0.24,
        "raster-brightness-max": 0.96,
        "raster-saturation": -0.22,
        "raster-contrast": 0.28,
        "raster-fade-duration": 200,
      },
    },
  ],
};

// Generate an organic curved bezier-like polyline between two GPS points
function generateCurvedRoute(
  start: [number, number],
  end: [number, number],
  curvature: number = 0.18,
  numPoints: number = 60
): [number, number][] {
  const points: [number, number][] = [];
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];

  // Perpendicular normal vector for curve bulge
  const nx = -dy * curvature;
  const ny = dx * curvature;

  const midX = (start[0] + end[0]) / 2 + nx;
  const midY = (start[1] + end[1]) / 2 + ny;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    // Quadratic Bézier curve formula: (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
    const lng = (1 - t) * (1 - t) * start[0] + 2 * (1 - t) * t * midX + t * t * end[0];
    const lat = (1 - t) * (1 - t) * start[1] + 2 * (1 - t) * t * midY + t * t * end[1];
    points.push([lng, lat]);
  }

  return points;
}

// Calculate progress percentage (0 - 100) based on shipment status or current coordinates
function getProgressFrac(status: string, hasCustomCoords: boolean): number {
  const s = (status || "").toUpperCase();
  if (s === "DELIVERED") return 1.0;
  if (s === "OUT_FOR_DELIVERY") return 0.88;
  if (s === "IN_TRANSIT" || s === "DELAYED") return 0.52;
  if (s === "DESTINATION_FACILITY") return 0.78;
  if (s === "ORIGIN_FACILITY") return 0.22;
  if (s === "PICKED_UP") return 0.12;
  return 0.05; // CREATED
}

export function ShipmentIsometricRouteVisualizer({
  trackingNumber,
  carrier = "NEXTRAK Pharma Road Reefer",
  serviceType = "Cryogenic Reefer Express (-20°C)",
  status,
  originCity,
  originLat,
  originLng,
  destinationCity,
  destinationLat,
  destinationLng,
  currentLat,
  currentLng,
  temperature = "-20.4°C",
  weightKg = 5.0,
  className = "h-[460px] sm:h-[520px]",
}: ShipmentVisualizerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const currentTruckPosRef = useRef<[number, number]>([sLng, sLat]);
  const currentTruckBearingRef = useRef<number>(0);
  const [is3DMode, setIs3DMode] = useState(true);

  // Default coordinate safeguards
  const sLng = originLng || 78.4867;
  const sLat = originLat || 17.385;
  const dLng = destinationLng || 77.209;
  const dLat = destinationLat || 28.6139;

  // Compute curved primary route and secondary alternate route
  const primaryRoutePoints = useMemo(() => {
    return generateCurvedRoute([sLng, sLat], [dLng, dLat], 0.14, 80);
  }, [sLng, sLat, dLng, dLat]);

  const alternateRoutePoints = useMemo(() => {
    return generateCurvedRoute([sLng, sLat], [dLng, dLat], -0.22, 60);
  }, [sLng, sLat, dLng, dLat]);

  // Determine current truck position along the curve
  const { truckPos, truckBearing } = useMemo(() => {
    let frac = getProgressFrac(status, !!(currentLat && currentLng));

    // If explicit currentLat/Lng was saved, find closest index or interpolate
    if (typeof currentLat === "number" && typeof currentLng === "number") {
      const totalDist = Math.hypot(dLng - sLng, dLat - sLat) || 1;
      const currentDist = Math.hypot(currentLng - sLng, currentLat - sLat);
      frac = Math.max(0.02, Math.min(0.98, currentDist / totalDist));
    }

    const idx = Math.min(
      primaryRoutePoints.length - 1,
      Math.max(0, Math.floor(frac * (primaryRoutePoints.length - 1)))
    );

    const pos = primaryRoutePoints[idx];
    const nextIdx = Math.min(primaryRoutePoints.length - 1, idx + 1);
    const nextPos = primaryRoutePoints[nextIdx];

    // Compute angle toward next point in degrees (0 = North, 90 = East)
    const dX = nextPos[0] - pos[0];
    const dY = nextPos[1] - pos[1];
    let angleDeg = (Math.atan2(dX, dY) * 180) / Math.PI;

    return {
      truckPos: pos,
      truckBearing: angleDeg,
    };
  }, [primaryRoutePoints, status, currentLat, currentLng, sLng, sLat, dLng, dLat]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let isMounted = true;
    let zoomTimer: NodeJS.Timeout | null = null;
    let animFrameId: number | null = null;

    // Centroid of route
    const centerLng = (sLng + dLng) / 2;
    const centerLat = (sLat + dLat) / 2;

    const map = new MapLibreMap({
      container: mapContainerRef.current,
      style: LUMINOUS_INDIA_MAP_STYLE,
      center: [centerLng, centerLat],
      zoom: 5.2,
      pitch: 58, // Isometric pitch angle
      bearing: -18, // 3D Isometric rotation
      attributionControl: false,
    });

    mapRef.current = map;

    map.on("load", () => {
      if (!isMounted) return;

      map.resize();

      // Fit bounds to embrace the entire route with padding
      const minLng = Math.min(sLng, dLng) - 1.2;
      const maxLng = Math.max(sLng, dLng) + 1.2;
      const minLat = Math.min(sLat, dLat) - 1.0;
      const maxLat = Math.max(sLat, dLat) + 1.0;

      map.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        {
          padding: { top: 60, bottom: 60, left: 60, right: 60 },
          pitch: 58,
          bearing: -18,
          duration: 1200,
        }
      );

      // 1. Secondary Dashed Orange Alternate Route
      map.addSource("route-alternate-src", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: alternateRoutePoints,
          },
        },
      });

      map.addLayer({
        id: "route-alternate-line",
        type: "line",
        source: "route-alternate-src",
        paint: {
          "line-color": "#FF8800",
          "line-width": 2,
          "line-dasharray": [3, 2],
          "line-opacity": 0.45,
        },
      });

      // 2. Primary Glowing Neon Orange Route Path
      map.addSource("route-primary-src", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: primaryRoutePoints,
          },
        },
      });

      // Layer A: Outer Neon Orange Aura Glow (#FF5500)
      map.addLayer({
        id: "route-outer-glow",
        type: "line",
        source: "route-primary-src",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#FF5500",
          "line-width": 16,
          "line-blur": 8,
          "line-opacity": 0.65,
        },
      });

      // Layer B: Mid Orange Aura (#FF8800)
      map.addLayer({
        id: "route-mid-glow",
        type: "line",
        source: "route-primary-src",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#FF8800",
          "line-width": 7,
          "line-blur": 2.5,
          "line-opacity": 0.9,
        },
      });

      // Layer C: Bright Glowing Core (#FFD080)
      map.addLayer({
        id: "route-core-line",
        type: "line",
        source: "route-primary-src",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#FFE090",
          "line-width": 3,
          "line-opacity": 1.0,
        },
      });

      // 3. ORIGIN MARKER (Pulsing Orange Radar Rings + Pinpoint)
      const originEl = document.createElement("div");
      originEl.className = "relative flex items-center justify-center cursor-pointer";
      originEl.innerHTML = `
        <div class="relative w-10 h-10 flex items-center justify-center">
          <span class="absolute inset-0 rounded-full animate-ping opacity-75 bg-[#FF6600]" style="animation-duration: 2s;"></span>
          <span class="absolute w-6 h-6 rounded-full border border-[#FF8800]/50 bg-[#FF5500]/20 animate-pulse"></span>
          <span class="relative w-3.5 h-3.5 rounded-full bg-[#FF7700] border-2 border-white shadow-[0_0_15px_#FF5500]"></span>
          <div class="absolute bottom-full mb-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-white bg-slate-950/90 border border-[#FF8800]/60 whitespace-nowrap shadow-xl backdrop-blur-md flex items-center gap-1">
            <span class="text-[#FF8800]">● ORIGIN:</span>
            <span>${originCity}</span>
          </div>
        </div>
      `;

      const originMarker = new MapLibreMarker({ element: originEl, anchor: "center" })
        .setLngLat([sLng, sLat])
        .addTo(map);

      // 4. DESTINATION MARKER (Target Bullseye with Rotating Target Rings)
      const destEl = document.createElement("div");
      destEl.className = "relative flex items-center justify-center cursor-pointer";
      destEl.innerHTML = `
        <div class="relative w-10 h-10 flex items-center justify-center">
          <span class="absolute inset-0 rounded-full border-2 border-dashed border-[#FF8800] animate-spin" style="animation-duration: 9s;"></span>
          <span class="absolute w-5 h-5 rounded-full bg-[#FF4400]/25 animate-pulse"></span>
          <span class="relative w-3.5 h-3.5 rounded-full bg-[#FF4400] border-2 border-white shadow-[0_0_15px_#FF4400]"></span>
          <div class="absolute bottom-full mb-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold text-white bg-slate-950/90 border border-[#FF4400]/60 whitespace-nowrap shadow-xl backdrop-blur-md flex items-center gap-1">
            <span class="text-[#FF4400]">◎ DESTINATION:</span>
            <span>${destinationCity}</span>
          </div>
        </div>
      `;

      const destMarker = new MapLibreMarker({ element: destEl, anchor: "center" })
        .setLngLat([dLng, dLat])
        .addTo(map);

      // 5. ILLUMINATED 3D ISOMETRIC REEFER TRUCK WITH GLOWING HEADLIGHTS
      currentTruckPosRef.current = truckPos;
      currentTruckBearingRef.current = truckBearing;

      const truckEl = document.createElement("div");
      truckEl.className = "relative flex items-center justify-center cursor-pointer group";

      truckEl.innerHTML = `
        <div class="relative flex items-center justify-center">
          <!-- Micro Sensor Status Badge Floating Above Truck (STRICTLY HORIZONTAL AT 0deg) -->
          <div
            id="truck-telemetry-badge"
            class="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-[#0D1B33]/95 border border-cyan shadow-2xl backdrop-blur-md whitespace-nowrap z-30 flex items-center gap-1.5 pointer-events-none"
            style="box-shadow: 0 4px 14px rgba(0,0,0,0.7);"
          >
            <span class="w-2 h-2 rounded-full bg-[#00F0FF] animate-ping"></span>
            <span class="text-cyan">${temperature}</span>
            <span class="text-slate-400">•</span>
            <span id="truck-speed-val" class="text-amber-400">68 km/h</span>
            <span class="text-slate-400">•</span>
            <span class="text-emerald-400 uppercase text-[9px]">${status}</span>
          </div>

          <!-- Rotating Body & Headlights Container (Rotated according to road heading) -->
          <div
            id="truck-rotating-chassis"
            class="relative flex items-center justify-center"
            style="transform: rotate(${truckBearing - 90}deg); transform-origin: center center;"
          >
            <!-- Forward Headlight Light Beam Cone -->
            <div
              class="absolute left-full top-1/2 -translate-y-1/2 pointer-events-none"
              style="
                width: 90px;
                height: 44px;
                background: linear-gradient(90deg, rgba(255, 230, 120, 0.9) 0%, rgba(255, 170, 0, 0.45) 45%, transparent 100%);
                clip-path: polygon(0% 40%, 100% 0%, 100% 100%, 0% 60%);
                filter: blur(2px);
                opacity: 0.95;
              "
            ></div>

            <!-- 3D Isometric Reefer Truck Chassis -->
            <div class="relative w-12 h-6 rounded-md bg-slate-900 border-2 border-[#00D4FF] shadow-[0_0_20px_rgba(0,212,255,0.7)] flex items-center justify-between px-1 z-20">
              <!-- Reefer Cold Box Body -->
              <div class="w-7 h-4 rounded bg-[#00D4FF]/25 border border-[#00D4FF]/60 flex items-center justify-center text-[7px] font-mono font-bold text-cyan">
                ❄ -20°
              </div>
              <!-- Cab & Windshield -->
              <div class="w-3 h-4 rounded-r bg-amber-400/90 flex items-center justify-center shadow-sm">
                <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              </div>
            </div>
          </div>
        </div>
      `;

      const truckMarker = new MapLibreMarker({ element: truckEl, anchor: "center" })
        .setLngLat(truckPos)
        .addTo(map);

      markersRef.current = [originMarker, destMarker, truckMarker];

      // 6. CINEMATIC SUPER-ZOOM ON LOAD (zoom 9.2 into vehicle corridor)
      zoomTimer = setTimeout(() => {
        if (!isMounted || !mapRef.current) return;
        mapRef.current.flyTo({
          center: currentTruckPosRef.current,
          zoom: 9.2,
          pitch: 58,
          bearing: -18,
          duration: 2200,
          essential: true,
        });
      }, 900);

      // 7. CONTINUOUS GLIDING TRUCK ANIMATION ALONG PRIMARY MULTI-WAYPOINT PATH
      let initialFrac = getProgressFrac(status, !!(currentLat && currentLng));
      if (typeof currentLat === "number" && typeof currentLng === "number") {
        const totalDist = Math.hypot(dLng - sLng, dLat - sLat) || 1;
        const currentDist = Math.hypot(currentLng - sLng, currentLat - sLat);
        initialFrac = Math.max(0.02, Math.min(0.98, currentDist / totalDist));
      }

      let animProgress = initialFrac;
      let lastTime = performance.now();

      const animateTruck = (now: number) => {
        if (!isMounted) return;
        const dt = (now - lastTime) / 1000;
        lastTime = now;

        // Smooth speed progression along the route
        animProgress += 0.012 * dt;
        if (animProgress >= 0.98) {
          animProgress = 0.02;
        }

        const totalSegments = primaryRoutePoints.length - 1;
        const floatIndex = animProgress * totalSegments;
        const i0 = Math.floor(floatIndex);
        const i1 = Math.min(i0 + 1, totalSegments);
        const segFrac = floatIndex - i0;

        const p0 = primaryRoutePoints[i0];
        const p1 = primaryRoutePoints[i1];

        if (p0 && p1) {
          const curLng = p0[0] + (p1[0] - p0[0]) * segFrac;
          const curLat = p0[1] + (p1[1] - p0[1]) * segFrac;

          const dX = p1[0] - p0[0];
          const dY = p1[1] - p0[1];
          const heading = (Math.atan2(dX, dY) * 180) / Math.PI;

          currentTruckPosRef.current = [curLng, curLat];
          currentTruckBearingRef.current = heading;

          truckMarker.setLngLat([curLng, curLat]);

          const chassis = truckEl.querySelector("#truck-rotating-chassis") as HTMLElement;
          if (chassis) {
            chassis.style.transform = `rotate(${heading - 90}deg)`;
          }

          const speedEl = truckEl.querySelector("#truck-speed-val") as HTMLElement;
          if (speedEl && Math.random() < 0.06) {
            const dynamicSpeed = 65 + Math.floor(Math.sin(now / 900) * 4);
            speedEl.textContent = `${dynamicSpeed} km/h`;
          }
        }

        animFrameId = requestAnimationFrame(animateTruck);
      };

      animFrameId = requestAnimationFrame(animateTruck);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) mapRef.current.resize();
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      isMounted = false;
      if (zoomTimer) clearTimeout(zoomTimer);
      if (animFrameId) cancelAnimationFrame(animFrameId);
      resizeObserver.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [sLng, sLat, dLng, dLat, primaryRoutePoints, alternateRoutePoints, truckPos, truckBearing, originCity, destinationCity, temperature, status]);

  // Controls Handlers
  const handleToggle3D = () => {
    if (!mapRef.current) return;
    const nextState = !is3DMode;
    setIs3DMode(nextState);

    mapRef.current.easeTo({
      pitch: nextState ? 58 : 0,
      bearing: nextState ? -18 : 0,
      duration: 800,
    });
  };

  const handleResetIsometric = () => {
    if (!mapRef.current) return;
    setIs3DMode(true);
    const minLng = Math.min(sLng, dLng) - 1.2;
    const maxLng = Math.max(sLng, dLng) + 1.2;
    const minLat = Math.min(sLat, dLat) - 1.0;
    const maxLat = Math.max(sLat, dLat) + 1.0;

    mapRef.current.fitBounds(
      [
        [minLng, minLat],
        [maxLng, maxLat],
      ],
      {
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
        pitch: 58,
        bearing: -18,
        duration: 1000,
      }
    );
  };

  const handleFocusTruck = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo({
      center: currentTruckPosRef.current,
      zoom: 9.2,
      pitch: 58,
      bearing: currentTruckBearingRef.current - 20,
      speed: 1.2,
      essential: true,
    });
  };

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-cyan/40 select-none shadow-2xl ${className}`}>
      {/* 3D MapLibre WebGL Canvas */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

      {/* Top Floating Telemetry & Corridor Pill */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/40 shadow-lg text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF8800] animate-pulse" />
          <span className="font-heading font-bold text-text-primary tracking-wide">
            3D Isometric Corridor
          </span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#FF8800]/20 text-[#FF8800] border border-[#FF8800]/40 font-semibold">
            {trackingNumber}
          </span>
          <span className="text-text-muted hidden sm:inline">
            {originCity} → {destinationCity}
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-xl bg-navy-950/90 backdrop-blur-md border border-border-subtle shadow-lg text-[11px] font-mono text-cyan">
          <Thermometer className="w-3.5 h-3.5" />
          <span>{temperature}</span>
          <span className="text-text-muted">•</span>
          <span className="text-emerald-400 font-bold">{status}</span>
        </div>
      </div>

      {/* Bottom Floating Legend Bar */}
      <div className="absolute bottom-3 left-3 z-20 pointer-events-none hidden sm:flex items-center gap-2">
        <div className="pointer-events-auto px-3 py-1.5 rounded-xl bg-navy-950/90 backdrop-blur-md border border-border-subtle text-[11px] flex items-center gap-4 text-text-secondary shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1 rounded-full bg-[#FF8800] shadow-[0_0_8px_#FF8800]" />
            <span className="text-text-primary font-medium">Primary Corridor (Active)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-0.5 border-t border-dashed border-[#FF8800]" />
            <span className="text-text-muted">Alternate Corridor</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-cyan" />
            <span className="text-cyan font-mono font-semibold">Live Reefer Unit</span>
          </div>
        </div>
      </div>

      {/* Floating Action Controls (Top Right / Bottom Right) */}
      <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-1.5">
        <button
          onClick={handleFocusTruck}
          className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/40 text-cyan hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
          title="Track Reefer Truck"
        >
          <Truck className="w-4 h-4" />
        </button>
        <button
          onClick={handleToggle3D}
          className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/40 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg text-[10px] font-mono font-bold"
          title={is3DMode ? "Switch to 2D Top-Down" : "Switch to 3D Isometric"}
        >
          {is3DMode ? "2D" : "3D"}
        </button>
        <button
          onClick={handleResetIsometric}
          className="w-8 h-8 rounded-xl bg-navy-950/90 backdrop-blur-md border border-cyan/40 text-text-primary hover:bg-navy-850 flex items-center justify-center transition shadow-lg"
          title="Reset 3D Perspective"
        >
          <RotateCcw className="w-4 h-4 text-cyan" />
        </button>
      </div>
    </div>
  );
}

