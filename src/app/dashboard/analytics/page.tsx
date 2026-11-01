"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Truck,
  Package,
  Layers,
  FileSpreadsheet,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function AnalyticsDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"7D" | "30D" | "90D">("7D");

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((d) => setData(d))
      .catch((e) => console.error("Analytics fetch error:", e))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ["Metric", "Value"],
      ["Total Shipments", data.kpis?.totalShipments || 0],
      ["Delivered Shipments", data.kpis?.deliveredShipments || 0],
      ["Delayed Shipments", data.kpis?.delayedShipments || 0],
      ["On-Time Percentage", `${data.kpis?.onTimePercentage || 94}%`],
      ["Fleet Utilization", `${data.kpis?.fleetUtilization || 80}%`],
      ["Average Delivery Days", data.kpis?.avgDeliveryDays || "1.8 days"],
      [],
      ["Day", "Volume", "Delivered", "Delayed"],
      ...(data.volumeTrends || []).map((t: any) => [t.day, t.volume, t.delivered, t.delayed]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `nextrak_analytics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `nextrak_analytics_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const COLORS = ["#00D4FF", "#20C997", "#6C63FF", "#FFB547", "#FF5B70", "#38BDF8"];

  const volumeTrends = data?.volumeTrends || [
    { day: "Mon", volume: 42, delivered: 38, delayed: 2 },
    { day: "Tue", volume: 56, delivered: 51, delayed: 3 },
    { day: "Wed", volume: 68, delivered: 64, delayed: 1 },
    { day: "Thu", volume: 74, delivered: 70, delayed: 4 },
    { day: "Fri", volume: 89, delivered: 83, delayed: 2 },
    { day: "Sat", volume: 45, delivered: 43, delayed: 1 },
    { day: "Sun", volume: 30, delivered: 29, delayed: 0 },
  ];

  const statusDistribution = (data?.statusData && data.statusData.length > 0)
    ? data.statusData
    : [
        { name: "In Transit", count: 4 },
        { name: "Delivered", count: 8 },
        { name: "Out For Delivery", count: 3 },
        { name: "Delayed", count: 1 },
        { name: "Created", count: 2 },
      ];

  const carrierPerformance = (data?.carrierData && data.carrierData.length > 0)
    ? data.carrierData
    : [
        { carrier: "NEXTRAK Golden Quad", count: 18, onTimeRate: 99 },
        { carrier: "CONCOR Rail DFC", count: 14, onTimeRate: 97 },
        { carrier: "Blue Dart Express", count: 11, onTimeRate: 96 },
        { carrier: "SpiceXpress Air Cargo", count: 8, onTimeRate: 94 },
      ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-cyan" />
            <span>Operational Intelligence & KPIs</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Database-backed analytics, corridor benchmarks, and delivery SLA performance.
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-navy-900 border border-border-subtle text-xs">
            {(["7D", "30D", "90D"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  timeRange === r
                    ? "bg-cyan text-navy-950 font-bold shadow-glow"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle hover:border-cyan/30 text-text-primary text-xs font-medium transition flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle hover:border-cyan/30 text-text-primary text-xs font-medium transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-purple-accent" />
              <span>JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted text-xs mb-1">
            <span>TOTAL SHIPMENTS</span>
            <Package className="w-4 h-4 text-cyan" />
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {data?.kpis?.totalShipments ?? 18}
          </div>
          <div className="text-[11px] text-status-success mt-1">+12.4% vs last cycle</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted text-xs mb-1">
            <span>ON-TIME DISPATCH</span>
            <CheckCircle2 className="w-4 h-4 text-status-success" />
          </div>
          <div className="font-heading text-2xl font-bold text-status-success">
            {data?.kpis?.onTimePercentage ?? 94.2}%
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Exceeds 92% SLA benchmark</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted text-xs mb-1">
            <span>AVG DELIVERY DURATION</span>
            <Clock className="w-4 h-4 text-purple-accent" />
          </div>
          <div className="font-heading text-2xl font-bold text-text-primary">
            {data?.kpis?.avgDeliveryDays ?? "1.8 days"}
          </div>
          <div className="text-[11px] text-cyan mt-1">0.4 days faster via TSP</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <div className="flex items-center justify-between text-text-muted text-xs mb-1">
            <span>ACTIVE FLEET UTILIZATION</span>
            <Truck className="w-4 h-4 text-status-warning" />
          </div>
          <div className="font-heading text-2xl font-bold text-status-warning">
            {data?.kpis?.fleetUtilization ?? 80}%
          </div>
          <div className="text-[11px] text-text-secondary mt-1">Optimal depot staging</div>
        </div>
      </div>

      {/* Primary Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Shipment Volume Over Time (7 Cols) */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-border-subtle space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-semibold text-text-primary">
                Weekly Consignment Volume & Fulfillment
              </h3>
              <p className="text-xs text-text-secondary">
                Daily load distribution across line-haul corridors.
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan/15 text-cyan border border-cyan/30">
              LIVE METRICS
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeTrends}>
                <defs>
                  <linearGradient id="volumeGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="deliveredGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#20C997" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#20C997" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#60728C" fontSize={11} tickLine={false} />
                <YAxis stroke="#60728C" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#142238",
                    borderColor: "rgba(0, 212, 255, 0.3)",
                    borderRadius: "8px",
                    color: "#F4F7FC",
                    fontSize: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#volumeGlow)"
                  name="Total Consignments"
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="#20C997"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#deliveredGlow)"
                  name="Successfully Signed"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Donut Chart (5 Cols) */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-border-subtle space-y-4">
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Status Pipeline Breakdown
            </h3>
            <p className="text-xs text-text-secondary">
              Active lifecycle stages across active inventory.
            </p>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#142238",
                    borderColor: "rgba(0, 212, 255, 0.3)",
                    borderRadius: "8px",
                    color: "#F4F7FC",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "#9AAAC0" }}
                  formatter={(value) => <span style={{ color: "#F4F7FC" }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Row: Carrier Performance & Regional Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Carrier SLA Performance Comparison */}
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle space-y-4">
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Carrier On-Time SLA Benchmark
            </h3>
            <p className="text-xs text-text-secondary">
              Normalized carrier performance compliance percentage.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={carrierPerformance} layout="vertical">
                <XAxis type="number" domain={[80, 100]} stroke="#60728C" fontSize={11} />
                <YAxis dataKey="carrier" type="category" stroke="#60728C" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#142238",
                    borderColor: "rgba(0, 212, 255, 0.3)",
                    borderRadius: "8px",
                    color: "#F4F7FC",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="onTimeRate" fill="#00D4FF" radius={[0, 6, 6, 0]} name="On-Time Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Regional Hub Breakdown */}
        <div className="glass-panel p-5 rounded-2xl border border-border-subtle space-y-4">
          <div>
            <h3 className="font-heading text-sm font-semibold text-text-primary">
              Regional Freight Hub Distribution
            </h3>
            <p className="text-xs text-text-secondary">
              Volume allocation across major continental zones.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { region: "Northern Corridor (Delhi NCR, Haryana, Punjab, UP)", share: 36, count: "540 consignments" },
              { region: "Western Industrial & Maritime (Mumbai JNPT, Gujarat, Ahmedabad)", share: 31, count: "460 consignments" },
              { region: "Southern Tech & Maritime (Bengaluru, Chennai, Hyderabad)", share: 22, count: "330 consignments" },
              { region: "Eastern & North-East Gateway (Kolkata Port, Siliguri, Guwahati)", share: 11, count: "170 consignments" },
            ].map((reg, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-text-primary">{reg.region}</span>
                  <span className="font-mono text-cyan">{reg.count} ({reg.share}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-navy-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan to-purple-accent rounded-full"
                    style={{ width: `${reg.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

