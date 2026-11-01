"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  Truck,
  TrendingUp,
  Thermometer,
  Gauge,
  AlertCircle,
  Radio,
  Anchor,
  Clock,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export function TelemetryBentoSidebar() {
  const [tickerIndex, setTickerIndex] = useState(0);

  const highwayAlerts = [
    { corridor: "Genome Valley → AIIMS Delhi", alert: "mRNA Vaccine Reefer nominal (-20.4°C stable)", severity: "success" },
    { corridor: "Serum Institute Pune → JNPT Port", alert: "WDFC Reefer Rake cleared at 78 km/h with twin gensets", severity: "success" },
    { corridor: "Zydus Changodar → Mumbai KEM", alert: "Recombinant Insulin Reefer entering Thane (+4.0°C)", severity: "success" },
    { corridor: "Delhi IGI Coolport → Kolkata Apollo", alert: "Emergency Plasma Air Lifeline touch down (-30.5°C verified)", severity: "success" },
    { corridor: "Biocon Park BLR → Apollo HYD", alert: "Monoclonal Antibody batch inward verified (+3.9°C)", severity: "success" },
    { corridor: "CDSCO National Telemetry Command", alert: "Form 20B/21B zero-excursion audit 99.94% compliant", severity: "info" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % highwayAlerts.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [highwayAlerts.length]);

  return (
    <div className="space-y-4">
      {/* 1. Active Shipments Counter with Live Status Pulse */}
      <div className="glass-panel p-5 rounded-2xl border border-border-subtle hover:border-cyan/30 transition space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-heading font-semibold uppercase tracking-wider text-[10px]">
            ACTIVE VACCINE & BIOLOGICS
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-status-success/15 text-status-success text-[10px] font-mono border border-status-success/30">
            <span className="w-1.5 h-1.5 rounded-full bg-status-success animate-pulse" />
            <span>ZERO EXCURSION</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="font-heading text-4xl font-extrabold text-text-primary tracking-tight">
            1,420
          </span>
          <span className="text-xs text-cyan font-mono font-medium">+84 batches today</span>
        </div>

        <p className="text-xs text-text-muted leading-relaxed">
          Temperature-controlled consignments actively tracked across CDSCO corridors & WDFC reefer rakes.
        </p>
      </div>

      {/* 2. Delivery Success Circular Gauge (99.9% Zero Excursion across 28 States & 8 UTs) */}
      <div className="glass-panel p-5 rounded-2xl border border-border-subtle hover:border-cyan/30 transition space-y-3">
        <div className="flex items-center justify-between text-xs text-text-secondary">
          <span className="font-heading font-semibold uppercase tracking-wider text-[10px]">
            CDSCO ZERO-EXCURSION RATE
          </span>
          <span className="text-[10px] font-mono text-cyan">Form 20B/21B Audited</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Circular SVG Gauge */}
          <div className="relative w-20 h-20 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              {/* Background Circle */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="3.2"
              />
              {/* Foreground Progress Circle (99.9%) */}
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#10B981"
                strokeWidth="3.2"
                strokeDasharray="99.9, 100"
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="font-heading font-bold text-sm text-text-primary">99.9%</span>
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-heading font-semibold text-xs text-text-primary">
              WHO-GDP Integrity Benchmark
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed">
              Exceeds Central Drugs Standard Control Organisation GDP requirements (+4.8%).
            </p>
          </div>
        </div>
      </div>

      {/* 3. In-Transit Telemetry Sparklines (Speed, Cold-Chain Temp, ETA %) */}
      <div className="glass-panel p-5 rounded-2xl border border-border-subtle space-y-3">
        <span className="font-heading font-semibold uppercase tracking-wider text-[10px] text-text-muted block">
          IN-TRANSIT TELEMETRY SPARKLINES
        </span>

        {/* Metric 1: Fleet Speed Sparkline */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-border-subtle space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-cyan" />
              <span>Avg Fleet Speed</span>
            </span>
            <span className="font-mono font-bold text-text-primary">62.4 km/h</span>
          </div>
          {/* Animated SVG Sparkline */}
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 200 28">
            <path
              d="M 0 20 Q 25 10 50 16 T 100 8 T 150 14 T 200 6"
              fill="none"
              stroke="#00F2FE"
              strokeWidth="2"
            />
            <circle cx="200" cy="6" r="3" fill="#00F2FE" className="animate-pulse" />
          </svg>
        </div>

        {/* Metric 2: Cold-Chain Temperature Sparkline */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-border-subtle space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5 text-status-success" />
              <span>Pharma Cold Chain</span>
            </span>
            <span className="font-mono font-bold text-status-success">-18.4°C (Deep Freeze)</span>
          </div>
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 200 28">
            <path
              d="M 0 14 Q 30 18 60 12 T 120 16 T 160 11 T 200 13"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
            />
            <circle cx="200" cy="13" r="3" fill="#10B981" className="animate-pulse" />
          </svg>
        </div>

        {/* Metric 3: On-Time ETA Adherence Sparkline */}
        <div className="p-3 rounded-xl bg-navy-900/60 border border-border-subtle space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-secondary flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-accent" />
              <span>ETA Precision Rate</span>
            </span>
            <span className="font-mono font-bold text-text-primary">98.8%</span>
          </div>
          <svg className="w-full h-7 overflow-visible" viewBox="0 0 200 28">
            <path
              d="M 0 22 Q 40 18 80 12 T 140 8 T 200 4"
              fill="none"
              stroke="#6C63FF"
              strokeWidth="2"
            />
            <circle cx="200" cy="4" r="3" fill="#6C63FF" className="animate-pulse" />
          </svg>
        </div>
      </div>

      {/* 4. Live Indian Highway / Port Alert Feed */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan/20 space-y-2">
        <div className="flex items-center justify-between text-xs pb-2 border-b border-border-subtle">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-status-warning animate-pulse" />
            <span className="font-heading font-semibold text-text-primary text-[11px]">
              Highway & Port Operations Ticker
            </span>
          </div>
          <span className="text-[10px] font-mono text-cyan">LIVE VTS</span>
        </div>

        <div className="p-2.5 rounded-xl bg-navy-900/80 border border-border-subtle min-h-[58px] flex flex-col justify-center transition-all duration-300">
          <span className="font-semibold text-xs text-text-primary block">
            {highwayAlerts[tickerIndex].corridor}
          </span>
          <span
            className={`text-[11px] mt-0.5 ${
              highwayAlerts[tickerIndex].severity === "warning"
                ? "text-status-warning"
                : "text-status-success"
            }`}
          >
            {highwayAlerts[tickerIndex].alert}
          </span>
        </div>
      </div>
    </div>
  );
}

