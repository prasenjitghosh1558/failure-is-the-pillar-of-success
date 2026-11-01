"use client";

import React, { useState, useEffect } from "react";
import {
  Route as RouteIcon,
  Plus,
  Trash2,
  Navigation,
  MapPin,
  Clock,
  Compass,
  CheckCircle2,
  Zap,
  TrendingDown,
  Layers,
  ArrowRight,
  Truck,
  RotateCcw,
} from "lucide-react";
import { InteractiveLogisticsMap, MapMarker } from "@/components/maps/InteractiveLogisticsMap";

export default function RouteOptimizationPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  // Form State
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [startLocation, setStartLocation] = useState("Delhi NCR - Alipur Multimodal Terminal");
  const [destination, setDestination] = useState("Mumbai / JNPT Container Port Terminal 2");
  const [stops, setStops] = useState<string[]>([
    "Jaipur Freight Park, Rajasthan",
    "Ahmedabad Western Terminal, Gujarat",
  ]);

  // Optimization Result State
  const [currentResult, setCurrentResult] = useState<any | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/fleet/vehicles").then((r) => r.json()),
      fetch("/api/fleet/drivers").then((r) => r.json()),
      fetch("/api/routes").then((r) => r.json()),
    ])
      .then(([vData, dData, rData]) => {
        if (vData?.vehicles) setVehicles(vData.vehicles);
        if (dData?.drivers) setDrivers(dData.drivers);
        if (rData?.routes) setRoutes(rData.routes);
        if (vData?.vehicles?.length > 0) setVehicleId(vData.vehicles[0].id);
        if (dData?.drivers?.length > 0) setDriverId(dData.drivers[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddStop = () => {
    if (stops.length < 8) {
      setStops([...stops, ""]);
    }
  };

  const handleRemoveStop = (index: number) => {
    setStops(stops.filter((_, i) => i !== index));
  };

  const handleStopChange = (index: number, val: string) => {
    const updated = [...stops];
    updated[index] = val;
    setStops(updated);
  };

  const handleRunOptimization = async (e: React.FormEvent) => {
    e.preventDefault();
    setOptimizing(true);
    try {
      const validStops = stops.filter((s) => s.trim().length > 0).map((address) => ({ address }));
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId,
          driverId,
          startLocation,
          destination,
          stops: validStops,
          optimizationType: "MULTI_STOP_TSP",
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentResult(data);
        // Refresh route history
        fetch("/api/routes")
          .then((r) => r.json())
          .then((d) => {
            if (d?.routes) setRoutes(d.routes);
          });
      } else {
        alert(data.error || "Route optimization failed");
      }
    } catch {
      alert("Error optimizing route");
    } finally {
      setOptimizing(false);
    }
  };

  // Build Map Markers for the active route (Delhi to Mumbai via Jaipur & Ahmedabad)
  const activeMarkers: MapMarker[] = [
    {
      id: "start-point",
      type: "hub",
      title: "DELHI NCR",
      subtitle: startLocation,
      lat: 28.6139,
      lng: 77.209,
      status: "Departure Origin Hub",
      sourceType: "TELEMATICS_GPS",
    },
    ...stops.map((stop, i) => ({
      id: `stop-${i + 1}`,
      type: "shipment" as const,
      title: `STOP ${i + 1}`,
      subtitle: stop || "Delivery Waypoint",
      lat: 26.91 - i * 3.8,
      lng: 75.78 - i * 3.2,
      status: `Sequence Order #${i + 1}`,
      sourceType: "SYSTEM_DEMO" as const,
    })),
    {
      id: "dest-point",
      type: "hub",
      title: "MUMBAI JNPT",
      subtitle: destination,
      lat: 18.95,
      lng: 72.82,
      status: "Final Port Destination",
      sourceType: "TELEMATICS_GPS",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-2.5">
          <RouteIcon className="w-6 h-6 text-cyan" />
          <span>Multi-Stop TSP Route Optimizer</span>
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Compute optimal waypoint sequencing via Mapbox Directions API and NEXTRAK 2-Opt Heuristic
          Engine.
        </p>
      </div>

      {/* Main Grid: Config Form & Interactive Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Config Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-panel p-5 rounded-2xl border border-border-subtle shadow-xl space-y-4">
            <h3 className="font-heading text-sm font-semibold text-text-primary flex items-center gap-2 pb-3 border-b border-border-subtle">
              <Compass className="w-4 h-4 text-cyan" />
              <span>Route Parameters & Waypoints</span>
            </h3>

            <form onSubmit={handleRunOptimization} className="space-y-3.5 text-xs">
              {/* Asset Assignment */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary block mb-1">Assigned Vehicle</label>
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  >
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registrationNumber} ({v.model})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-text-secondary block mb-1">CDL Driver</label>
                  <select
                    value={driverId}
                    onChange={(e) => setDriverId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  >
                    {drivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Start Depot */}
              <div>
                <label className="text-text-secondary block mb-1 font-medium">
                  Departure Origin Hub *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-purple-accent absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Intermediate Stops */}
              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-text-secondary font-medium">Intermediate Stops ({stops.length}/8)</span>
                  <button
                    type="button"
                    onClick={handleAddStop}
                    className="text-cyan hover:underline flex items-center gap-1 font-medium"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Stop</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {stops.map((stop, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-navy-850 text-cyan text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        placeholder={`Stop #${idx + 1} address or hub name`}
                        value={stop}
                        onChange={(e) => handleStopChange(idx, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveStop(idx)}
                        className="text-text-muted hover:text-status-error p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Final Destination */}
              <div className="pt-2 border-t border-border-subtle">
                <label className="text-text-secondary block mb-1 font-medium">
                  Final Destination Arrival *
                </label>
                <div className="relative">
                  <Navigation className="w-4 h-4 text-status-success absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Optimization Trigger Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={optimizing}
                  className="w-full py-3 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{optimizing ? "Solving TSP Coordinates..." : "Generate Optimized Route"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Map & Results Panel (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Optimization Results Banner */}
          {currentResult && (
            <div className="glass-panel-glow p-4 rounded-2xl border border-cyan/40 shadow-xl space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-status-success" />
                  <span className="font-heading font-bold text-xs text-text-primary">
                    Optimization Matrix Solved
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan/15 text-cyan border border-cyan/30">
                    {currentResult.optimizationResult?.source || "NEXTRAK_TSP_ENGINE"}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-status-success">
                  <TrendingDown className="w-4 h-4" />
                  <span>{currentResult.optimizationResult?.savingsPercent || 15.8}% Transit Saved</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">TOTAL DISTANCE</span>
                  <span className="font-mono font-bold text-text-primary text-sm">
                    {currentResult.route?.totalDistanceKm} KM
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">EST. DURATION</span>
                  <span className="font-heading font-bold text-cyan text-sm">
                    {currentResult.route?.estimatedDuration}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">WAYPOINTS</span>
                  <span className="font-mono font-bold text-text-primary text-sm">
                    {currentResult.route?.stops?.length || stops.length} STOPS
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle">
                  <span className="text-[10px] text-text-muted block">ASSIGNED CDL</span>
                  <span className="font-semibold text-text-primary text-xs truncate block">
                    {currentResult.route?.driver?.name || "Marcus Vance"}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Route Map */}
          <div className="glass-panel p-3 rounded-2xl border border-border-subtle">
            <InteractiveLogisticsMap markers={activeMarkers} className="h-[460px]" />
          </div>

          {/* Planned Routes Table */}
          <div className="glass-panel p-4 rounded-2xl border border-border-subtle">
            <h4 className="font-heading text-xs font-semibold uppercase tracking-wider text-text-secondary mb-3">
              Planned & Dispatched Routes ({routes.length})
            </h4>
            <div className="space-y-2">
              {routes.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl bg-navy-900/60 border border-border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-text-primary">
                        {r.routeNumber}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-cyan/15 text-cyan font-mono">
                        {r.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted mt-0.5 block">
                      {r.startLocation} → {r.destination}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <span className="font-mono font-bold text-text-primary block">
                        {r.totalDistanceKm} km
                      </span>
                      <span className="text-[10px] text-text-muted">{r.estimatedDuration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

