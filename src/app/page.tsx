"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Compass,
  Package,
  Search,
  Truck,
  Route as RouteIcon,
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Radio,
  Zap,
  Globe2,
  Clock,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sparkles,
  Train,
  Thermometer,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import dynamic from "next/dynamic";
import { IndiaFreightCalculator } from "@/components/dashboard/IndiaFreightCalculator";

// Code-split Native India Freight & Telemetry Matrix (100% Native WebGL, Keyless, Zero Carto CDN)
const NativeIndiaMatrixMap = dynamic(
  () =>
    import("@/components/map/NativeIndiaMatrixMap").then(
      (mod) => mod.NativeIndiaMatrixMap
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-[520px] sm:h-[620px] w-full rounded-2xl glass-panel border border-cyan/30 flex flex-col items-center justify-center space-y-3 bg-navy-950">
        <div className="w-8 h-8 rounded-full border-2 border-cyan border-t-transparent animate-spin" />
        <span className="text-xs font-mono text-cyan tracking-wider uppercase">
          Initializing Native WebGL India Freight & Telemetry Matrix...
        </span>
      </div>
    ),
  }
);

export default function LandingPage() {
  const router = useRouter();
  const [trackingInput, setTrackingInput] = useState("");
  const [liveShipments, setLiveShipments] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/shipments?limit=5")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.shipments) {
          setLiveShipments(data.shipments);
        }
      })
      .catch(() => setLiveShipments([]));
  }, []);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      router.push(`/track/${encodeURIComponent(trackingInput.trim().toUpperCase())}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[650px] h-[340px] bg-gradient-to-tr from-cyan/15 via-purple-accent/10 to-transparent blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Top Pill */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border border-cyan/40 text-xs text-text-primary shadow-glow transition-all"
            >
              <span className="w-2 h-2 rounded-full bg-cyan animate-pulse" />
              <span className="font-heading font-medium tracking-wide">
                PAN-INDIA MEDICAL COLD-CHAIN RADAR • CDSCO & WHO-GDP COMPLIANT
              </span>
              <span className="px-1.5 py-0.5 rounded bg-cyan/15 text-cyan text-[10px] font-mono font-semibold">
                REAL-TIME IOT TELEMETRY
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-heading text-4xl sm:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.15]"
            >
              Zero-Excursion Visibility across{" "}
              <span className="text-gradient">Indian Medical & Vaccine</span> Corridors.
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal"
            >
              Mission-critical healthcare logistics OS tracking temperature-controlled biologics (-80°C to +25°C),
              WDFC refrigerated container rakes, emergency air-cargo plasma lifelines, and hospital depot manifests.
            </motion.p>

            {/* Prominent Search Bar Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="pt-4 max-w-2xl mx-auto"
            >
              <form
                onSubmit={handleTrackSubmit}
                className="glass-panel-glow p-2 rounded-2xl border border-cyan/40 shadow-glow flex flex-col sm:flex-row items-center gap-2"
              >
                <div className="flex items-center gap-3 w-full px-3 py-2">
                  <Search className="w-5 h-5 text-cyan shrink-0" />
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value)}
                    placeholder="Enter Batch No, Vaccine Consignment, or Tracking ID..."
                    className="w-full bg-transparent border-none text-text-primary font-mono text-sm sm:text-base focus:outline-none placeholder:text-text-muted"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-sm hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2 shrink-0"
                >
                  <span>Track Consignment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Quick Live Tracking Chips or Create Prompt */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
                {liveShipments.length > 0 ? (
                  <>
                    <span className="text-text-muted font-medium mr-1">Active Shipments:</span>
                    {liveShipments.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => router.push(`/track/${s.trackingNumber}`)}
                        className="px-2.5 py-1 rounded-lg glass-panel hover:border-cyan/50 text-text-primary hover:text-cyan font-mono text-[11px] transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span className="font-semibold">{s.trackingNumber}</span>
                        <span className="text-[10px] text-text-muted">({s.currentStatus})</span>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="flex items-center gap-2 text-text-muted text-[11px]">
                    <span>No pre-seeded consignments.</span>
                    <Link
                      href="/dashboard/shipments"
                      className="text-cyan font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>+ Create your first shipment manifest in Command Center</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Hero Live Interactive India Map Preview */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12 rounded-2xl glass-panel-glow p-2 sm:p-4 border border-cyan/30 shadow-2xl"
          >
            <div className="flex items-center justify-between pb-3 px-2 border-b border-border-subtle mb-3">
              <div className="flex items-center gap-2 text-xs text-text-secondary">
                <Radio className="w-4 h-4 text-cyan animate-pulse" />
                <span className="font-heading font-medium text-text-primary">
                  Official National Medical Cold-Chain & Vaccine Matrix
                </span>
                <span className="text-text-muted hidden sm:inline">
                  • Click any cluster (Genome Valley, Serum Institute, Biocon, AIIMS) to inspect live telematics
                </span>
              </div>
              <Link
                href="/dashboard/live-tracking"
                className="text-xs text-cyan hover:underline flex items-center gap-1 font-medium"
              >
                <span>Full Command Control Room</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <NativeIndiaMatrixMap className="h-[520px] sm:h-[620px]" />
          </motion.div>

          {/* Indian Operations Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Monitored Biologics Pallets", value: "85,400+", icon: Thermometer, change: "Zero-Excursion Integrity: 99.94%" },
              { label: "CDSCO GDP Compliance SLA", value: "99.9%", icon: CheckCircle2, change: "Form 20B/21B Audited" },
              { label: "Cryo Reefer Rakes (WDFC Rail)", value: "-20°C to -80°C", icon: Train, change: "Serum & Vaccine Rakes" },
              { label: "IoT Sensor Pings / Day", value: "4.2M", icon: Radio, change: "Under 5ms alert tripwires" },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-4 rounded-xl border border-border-subtle hover:border-cyan/30 transition group"
                >
                  <div className="flex items-center justify-between text-text-secondary mb-2">
                    <span className="text-xs font-medium">{stat.label}</span>
                    <Icon className="w-4 h-4 text-cyan group-hover:scale-110 transition" />
                  </div>
                  <div className="font-heading text-2xl font-bold text-text-primary">
                    {stat.value}
                  </div>
                  <div className="text-[11px] text-status-success font-medium mt-1">
                    {stat.change}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive India Freight Calculator Section */}
      <section className="py-16 border-t border-border-subtle bg-navy-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan">
              Instant Estimation
            </h2>
            <p className="font-heading text-3xl font-bold text-text-primary">
              Calculate Medical Cold-Chain & Reefer Rates
            </p>
            <p className="text-xs text-text-secondary">
              CDSCO Form 20B/21B verified routes, cryogenic/dry-ice surcharges in INR (₹), and DFC reefer rake savings.
            </p>
          </div>
          <IndiaFreightCalculator />
        </div>
      </section>

      {/* Platform Features Grid */}
      <section className="py-20 border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-mono uppercase tracking-widest text-cyan">
              Healthcare Logistics Engineering
            </h2>
            <p className="font-heading text-3xl font-bold text-text-primary">
              Engineered for Critical Indian Cold-Chain Corridors
            </p>
            <p className="text-sm text-text-secondary">
              From Genome Valley biopharma labs to Himalayan high-altitude military hospital depots.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "CDSCO & WHO-GDP Sovereign Canvas",
                description:
                  "Accurate sovereign boundaries rendering 23 national vaccine hubs, biotech clusters, and hospital depots with zero lag.",
                icon: Compass,
                color: "text-cyan",
                badge: "GEOSPATIAL",
              },
              {
                title: "Multimodal Vaccine & Reefer Corridors",
                description:
                  "WDFC & EDFC dedicated refrigerated container rakes with twin gensets operating seamlessly alongside NH-44 highway reefers.",
                icon: Train,
                color: "text-status-success",
                badge: "REEFER RAIL",
              },
              {
                title: "Emergency Air Plasma & Organ Lifelines",
                description:
                  "Direct airport coolport apron integration (IGI DEL, Kempegowda BLR, Rajiv Gandhi HYD) for life-critical organ and plasma transit.",
                icon: Zap,
                color: "text-purple-accent",
                badge: "AIR LIFELINE",
              },
              {
                title: "Continuous Cryogenic (-80°C to +25°C) Telemetry",
                description:
                  "Live IoT temperature and humidity telemetry with instantaneous SMS/email tripwire alerts for vaccine and biologic safety.",
                icon: Thermometer,
                color: "text-cyan",
                badge: "ZERO-EXCURSION",
              },
              {
                title: "2-Opt Medical Depot TSP Routing",
                description:
                  "Algorithmic multi-depot optimization ensuring prompt delivery to hospital cold rooms while bypassing congested urban no-entry hours.",
                icon: RouteIcon,
                color: "text-status-warning",
                badge: "TSP ROUTING",
              },
              {
                title: "5-Role Life-Sciences Telemetry OS",
                description:
                  "Dedicated role-specific operational views for CDSCO Super Admins, Dispatchers, Hospital Receivers, Fleet Managers, and Drivers.",
                icon: ShieldCheck,
                color: "text-status-success",
                badge: "MULTI-ROLE OS",
              },
            ].map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="glass-panel p-6 rounded-2xl border border-border-subtle hover:border-cyan/30 hover:shadow-card transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-navy-850 border border-border-subtle flex items-center justify-center">
                        <Icon className={`w-5 h-5 ${feature.color}`} />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-navy-850 text-text-secondary border border-border-subtle">
                        {feature.badge}
                      </span>
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-text-primary mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-cyan font-medium">
                    <span>Inspect compliance specs</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Commercial Call to Action */}
      <section className="py-20 relative overflow-hidden border-t border-border-subtle">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/15 text-cyan text-xs font-mono border border-cyan/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ready for CDSCO-Grade Production Deployment Across India</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-text-primary">
            Secure Your Life-Saving Medical & Vaccine Cold Chain
          </h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
            Gain real-time visibility into cryogenic biologics, DFC reefer rakes, hospital depot inventory, and cold-chain compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/dashboard/live-tracking"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-sm hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2"
            >
              <span>Launch PharmaOS Command Room</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/shipments"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl glass-panel text-text-primary font-heading font-semibold text-sm hover:bg-navy-800 transition border border-border-subtle"
            >
              <span>Manage Shipments & Manifests</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
