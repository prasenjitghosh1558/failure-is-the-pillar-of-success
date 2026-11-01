"use client";

import React, { useState } from "react";
import {
  Calculator,
  Truck,
  Train,
  Plane,
  Thermometer,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Leaf,
  Clock,
  IndianRupee,
  Sparkles,
} from "lucide-react";

export const INDIAN_LOCATIONS = [
  { city: "Hyderabad / Genome Valley", state: "Telangana Hub", code: "HYD" },
  { city: "Delhi NCR / AIIMS Reserve", state: "National Hub", code: "DEL" },
  { city: "Pune / Serum Institute Hub", state: "Maharashtra", code: "PNQ" },
  { city: "Ahmedabad / Zydus Changodar", state: "Gujarat", code: "AMD" },
  { city: "Mumbai / JNPT Cold Port", state: "Maharashtra", code: "BOM" },
  { city: "Bengaluru / Biocon Park", state: "Karnataka", code: "BLR" },
  { city: "Kolkata / Apollo Medical Gateway", state: "West Bengal", code: "CCU" },
  { city: "Nagpur / MIHAN Life Sciences", state: "Central Hub", code: "NAG" },
  { city: "Chennai / Sriperumbudur MedTech", state: "Tamil Nadu", code: "MAA" },
  { city: "Jaipur / Sitapura Pharma SEZ", state: "Rajasthan", code: "JAI" },
  { city: "Guwahati / Regional Vaccine Gateway", state: "Assam / NE", code: "GAU" },
  { city: "Kochi / Vallarpadam Life Sciences", state: "Kerala", code: "COK" },
];

export function IndiaFreightCalculator() {
  const [origin, setOrigin] = useState("Hyderabad / Genome Valley");
  const [destination, setDestination] = useState("Delhi NCR / AIIMS Reserve");
  const [mode, setMode] = useState<"FTL_REEFER" | "LTL_COLD" | "RAIL_DFC_REEFER" | "AIR_EXPRESS_LIFELINE">("FTL_REEFER");
  const [temperatureRegime, setTemperatureRegime] = useState<"CRYO_80" | "FROZEN_20" | "COLD_2_8" | "AMBIENT_15_25">("FROZEN_20");
  const [weightTons, setWeightTons] = useState<number>(12);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingRef, setBookingRef] = useState<string | null>(null);

  // Dynamic distance estimate matrix for key Indian routes
  const getDistanceKm = (from: string, to: string) => {
    if (from === to) return 80;
    const key = `${from}-${to}`;
    if (key.includes("Delhi") && key.includes("Mumbai")) return 1410;
    if (key.includes("Bengaluru") && key.includes("Delhi")) return 2150;
    if (key.includes("Mumbai") && key.includes("Bengaluru")) return 980;
    if (key.includes("Kolkata") && key.includes("Chennai")) return 1660;
    if (key.includes("Nagpur") && key.includes("Hyderabad")) return 500;
    if (key.includes("Hyderabad") && key.includes("Delhi")) return 1580;
    if (key.includes("Ahmedabad") && key.includes("Mumbai")) return 520;
    if (key.includes("Pune") && key.includes("Mumbai")) return 150;
    if (key.includes("Kolkata") && key.includes("Guwahati")) return 990;
    return 1120;
  };

  const distance = getDistanceKm(origin, destination);

  // Rate Calculation Formula in INR (₹)
  const calculateRate = () => {
    let baseRatePerKm = 48; // Base cold chain rate
    let hours = Math.round(distance / 58);
    let co2SavedKg = Math.round(distance * 0.14 * weightTons);

    if (mode === "FTL_REEFER") {
      baseRatePerKm = 52;
      hours = Math.round(distance / 60);
    } else if (mode === "LTL_COLD") {
      baseRatePerKm = 36;
      hours = Math.round(distance / 50) + 8; // cold room cross-dock handling
    } else if (mode === "RAIL_DFC_REEFER") {
      baseRatePerKm = 28;
      hours = Math.round(distance / 72) + 4;
      co2SavedKg = Math.round(distance * 0.42 * weightTons); // Heavy carbon reduction
    } else if (mode === "AIR_EXPRESS_LIFELINE") {
      baseRatePerKm = 140;
      hours = Math.round(distance / 500) + 3;
      co2SavedKg = 0;
    }

    // Temperature Regime Premium
    if (temperatureRegime === "CRYO_80") {
      baseRatePerKm *= 1.65; // Dry ice / liquid nitrogen active telemetry
    } else if (temperatureRegime === "FROZEN_20") {
      baseRatePerKm *= 1.35; // -20°C frozen reefer
    } else if (temperatureRegime === "COLD_2_8") {
      baseRatePerKm *= 1.20; // +2°C to +8°C vaccine/biologics standard
    } else {
      baseRatePerKm *= 1.05; // Controlled ambient
    }

    const estimatedCost = Math.round(distance * baseRatePerKm * (weightTons / 10));

    return {
      rateInr: estimatedCost > 18000 ? estimatedCost : 24500,
      transitHours: hours > 2 ? hours : 3,
      co2SavedKg: co2SavedKg > 30 ? co2SavedKg : 60,
    };
  };

  const quote = calculateRate();

  const handleBooking = () => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ref = `CDSCO-EWB-VAX-${randomSuffix}`;
    setBookingRef(ref);
    setIsBooked(true);
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-border-subtle shadow-xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-cyan" />
          <h3 className="font-heading font-bold text-base text-text-primary">
            CDSCO Cold-Chain & Reefer Rate Calculator
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30">
          Form 20B/21B Compliant
        </span>
      </div>

      {/* Mode Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: "FTL_REEFER", label: "Dedicated Smart Reefer", icon: Truck },
          { id: "LTL_COLD", label: "Pharma Parcel Cold LTL", icon: Truck },
          { id: "RAIL_DFC_REEFER", label: "WDFC Reefer Rake", icon: Train },
          { id: "AIR_EXPRESS_LIFELINE", label: "Emergency Air Lifeline", icon: Plane },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = mode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => {
                setMode(m.id as any);
                setIsBooked(false);
              }}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-semibold transition border ${
                isActive
                  ? "bg-cyan text-navy-950 font-bold shadow-glow border-cyan"
                  : "bg-navy-900/60 text-text-secondary hover:text-text-primary border-border-subtle"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Origin, Destination, Weight & Temperature Regime Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div>
          <label className="text-text-secondary block mb-1 font-medium">Origin Pharma Hub</label>
          <select
            value={origin}
            onChange={(e) => {
              setOrigin(e.target.value);
              setIsBooked(false);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
          >
            {INDIAN_LOCATIONS.map((loc) => (
              <option key={`orig-${loc.city}`} value={loc.city}>
                {loc.city} ({loc.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-text-secondary block mb-1 font-medium">Destination Hospital / Port</label>
          <select
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setIsBooked(false);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
          >
            {INDIAN_LOCATIONS.map((loc) => (
              <option key={`dest-${loc.city}`} value={loc.city}>
                {loc.city} ({loc.state})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-text-secondary block mb-1 font-medium">
            Payload Weight ({mode === "AIR_EXPRESS_LIFELINE" ? "Kilograms" : "Pallets / Tons"})
          </label>
          <input
            type="number"
            min="1"
            max="120"
            value={weightTons}
            onChange={(e) => {
              setWeightTons(Number(e.target.value) || 1);
              setIsBooked(false);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono font-bold"
          />
        </div>

        <div>
          <label className="text-text-secondary block mb-1 font-medium">Temperature Regime</label>
          <select
            value={temperatureRegime}
            onChange={(e) => {
              setTemperatureRegime(e.target.value as any);
              setIsBooked(false);
            }}
            className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
          >
            <option value="CRYO_80">-80°C Cryogenic / Dry Ice (mRNA Vaccines)</option>
            <option value="FROZEN_20">-20°C Frozen Biologics (Vaccines / Plasma)</option>
            <option value="COLD_2_8">+2°C to +8°C Cold Chain (Insulin / Biologics)</option>
            <option value="AMBIENT_15_25">+15°C to +25°C Controlled Ambient Pharma</option>
          </select>
        </div>
      </div>

      {/* Calculated Dynamic Quote Result Box */}
      <div className="p-5 rounded-2xl bg-navy-900/80 border border-cyan/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <span className="text-[10px] text-text-muted font-mono uppercase block">
              ESTIMATED FREIGHT (INR)
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold text-cyan flex items-center">
              <span>₹{quote.rateInr.toLocaleString("en-IN")}</span>
            </div>
            <span className="text-[10px] text-text-secondary">+12% Pharma GST Applicable</span>
          </div>

          <div>
            <span className="text-[10px] text-text-muted font-mono uppercase block">
              EXCURSION-SAFE SLA
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold text-text-primary flex items-center gap-1.5">
              <Clock className="w-5 h-5 text-status-success" />
              <span>{quote.transitHours}h</span>
            </div>
            <span className="text-[10px] text-text-secondary">{distance} km cold corridor</span>
          </div>

          <div>
            <span className="text-[10px] text-text-muted font-mono uppercase block">
              DFC REEFER SAVINGS
            </span>
            <div className="font-heading text-2xl sm:text-3xl font-extrabold text-status-success flex items-center gap-1">
              <Leaf className="w-5 h-5" />
              <span>{quote.co2SavedKg} kg</span>
            </div>
            <span className="text-[10px] text-status-success font-medium">CO₂ Reduction vs Highway</span>
          </div>
        </div>

        {/* Action Button */}
        <div>
          {isBooked ? (
            <div className="p-3 rounded-xl bg-status-success/20 border border-status-success/40 text-status-success text-xs font-mono space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Cold Manifest Confirmed!</span>
              </div>
              <div className="text-[11px] text-text-primary">CDSCO E-Way Bill: {bookingRef}</div>
            </div>
          ) : (
            <button
              onClick={handleBooking}
              className="px-8 py-3.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-sm hover:bg-cyan/90 transition shadow-glow flex items-center gap-2"
            >
              <span>Book CDSCO Cold Manifest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

