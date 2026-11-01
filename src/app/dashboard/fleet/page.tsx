"use client";

import React, { useState, useEffect } from "react";
import {
  Truck,
  User,
  Plus,
  BatteryCharging,
  Fuel,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Phone,
  Mail,
  Shield,
  Star,
  RefreshCw,
  X,
  Radio,
  MapPin,
} from "lucide-react";

export default function FleetManagementPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"VEHICLES" | "DRIVERS">("VEHICLES");

  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);

  // New Vehicle Form
  const [vehicleForm, setVehicleForm] = useState({
    registrationNumber: "",
    vehicleType: "Heavy Multi-Axle 55T",
    model: "Tata Prima 5530.S Euro VI",
    year: "2024",
    fuelLevelPercent: "95",
    batteryPercent: "95",
    telematicsProvider: "SAMSARA",
    driverId: "",
  });

  // New Driver Form
  const [driverForm, setDriverForm] = useState({
    name: "",
    email: "",
    phone: "",
    licenseNumber: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [vRes, dRes] = await Promise.all([
        fetch("/api/fleet/vehicles"),
        fetch("/api/fleet/drivers"),
      ]);
      const vData = await vRes.json();
      const dData = await dRes.json();
      if (vData?.vehicles) setVehicles(vData.vehicles);
      if (dData?.drivers) setDrivers(dData.drivers);
    } catch (e) {
      console.error("Fleet fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/fleet/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vehicleForm),
      });
      if (res.ok) {
        setIsVehicleModalOpen(false);
        setVehicleForm({
          registrationNumber: "",
          vehicleType: "Semi-Truck Electric",
          model: "Tesla Semi 2024",
          year: "2024",
          fuelLevelPercent: "95",
          batteryPercent: "95",
          telematicsProvider: "SAMSARA",
          driverId: "",
        });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register vehicle");
      }
    } catch {
      alert("Error registering vehicle");
    }
  };

  const handleCreateDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/fleet/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(driverForm),
      });
      if (res.ok) {
        setIsDriverModalOpen(false);
        setDriverForm({ name: "", email: "", phone: "", licenseNumber: "" });
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register driver");
      }
    } catch {
      alert("Error registering driver");
    }
  };

  const totalVehicles = vehicles.length;
  const activeCount = vehicles.filter(
    (v) => v.status === "ACTIVE" || v.status === "IN_TRANSIT"
  ).length;
  const availableCount = vehicles.filter((v) => v.status === "AVAILABLE").length;
  const maintenanceCount = vehicles.filter((v) => v.status === "MAINTENANCE").length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-text-primary flex items-center gap-2.5">
            <Truck className="w-6 h-6 text-cyan" />
            <span>Fleet & Telematics Management</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Real-time IoT diagnostics, fuel/energy states, and driver assignments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-xl bg-navy-900 border border-border-subtle text-xs">
            <button
              onClick={() => setActiveTab("VEHICLES")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "VEHICLES"
                  ? "bg-cyan text-navy-950 font-bold shadow-glow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Vehicles ({vehicles.length})
            </button>
            <button
              onClick={() => setActiveTab("DRIVERS")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "DRIVERS"
                  ? "bg-cyan text-navy-950 font-bold shadow-glow"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Drivers ({drivers.length})
            </button>
          </div>

          <button
            onClick={() =>
              activeTab === "VEHICLES"
                ? setIsVehicleModalOpen(true)
                : setIsDriverModalOpen(true)
            }
            className="px-3.5 py-2 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>{activeTab === "VEHICLES" ? "Add Vehicle" : "Add Driver"}</span>
          </button>
        </div>
      </div>

      {/* Fleet KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <span className="text-xs text-text-muted">Total Fleet Assets</span>
          <div className="font-heading text-2xl font-bold text-text-primary mt-1">
            {totalVehicles} Units
          </div>
          <span className="text-[11px] text-text-secondary">Commercial registered</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <span className="text-xs text-text-muted">Active On Route</span>
          <div className="font-heading text-2xl font-bold text-cyan mt-1">
            {activeCount}
          </div>
          <span className="text-[11px] text-cyan font-medium">Currently dispatching</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <span className="text-xs text-text-muted">Staged & Available</span>
          <div className="font-heading text-2xl font-bold text-status-success mt-1">
            {availableCount}
          </div>
          <span className="text-[11px] text-status-success">Ready for assignment</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-border-subtle">
          <span className="text-xs text-text-muted">In Maintenance</span>
          <div className="font-heading text-2xl font-bold text-status-warning mt-1">
            {maintenanceCount}
          </div>
          <span className="text-[11px] text-status-warning">Depot service check</span>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === "VEHICLES" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="glass-panel p-5 rounded-2xl border border-border-subtle hover:border-cyan/30 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-navy-850 border border-border-subtle flex items-center justify-center text-cyan">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-mono text-sm font-bold text-text-primary">
                        {v.registrationNumber}
                      </h4>
                      <p className="text-xs text-text-secondary">{v.model}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      v.status === "IN_TRANSIT" || v.status === "ACTIVE"
                        ? "bg-cyan/15 text-cyan border border-cyan/30"
                        : v.status === "AVAILABLE"
                        ? "bg-status-success/15 text-status-success border border-status-success/30"
                        : "bg-status-warning/15 text-status-warning border border-status-warning/30"
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                {/* Telemetry specs */}
                <div className="mt-4 pt-3 border-t border-border-subtle grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle">
                    <div className="flex items-center gap-1.5 text-text-muted text-[10px] mb-1">
                      <BatteryCharging className="w-3.5 h-3.5 text-status-success" />
                      <span>BATTERY / FUEL</span>
                    </div>
                    <span className="font-mono font-bold text-text-primary text-sm">
                      {v.batteryPercent || v.fuelLevelPercent}%
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-navy-900 border border-border-subtle">
                    <div className="flex items-center gap-1.5 text-text-muted text-[10px] mb-1">
                      <Radio className="w-3.5 h-3.5 text-cyan" />
                      <span>TELEMATICS</span>
                    </div>
                    <span className="font-mono font-bold text-cyan text-xs">
                      {v.telematicsProvider}
                    </span>
                  </div>
                </div>

                {/* Assigned Driver */}
                <div className="mt-3 text-xs flex items-center justify-between p-2.5 rounded-xl bg-navy-900/60 border border-border-subtle">
                  <span className="text-text-muted">Assigned Driver:</span>
                  <span className="font-semibold text-text-primary">
                    {v.driver?.name || "Unassigned"}
                  </span>
                </div>

                {/* GPS Pin */}
                <div className="mt-2 text-[11px] text-text-muted flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-cyan" />
                  <span>
                    {v.lastLatitude.toFixed(3)}, {v.lastLongitude.toFixed(3)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* DRIVERS TAB */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {drivers.map((d) => (
            <div
              key={d.id}
              className="glass-panel p-5 rounded-2xl border border-border-subtle hover:border-cyan/30 transition space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan/15 text-cyan flex items-center justify-center font-bold text-sm">
                    {d.name.slice(0, 1)}
                  </div>
                  <div>
                    <h4 className="font-heading text-sm font-bold text-text-primary">
                      {d.name}
                    </h4>
                    <span className="text-[11px] font-mono text-cyan">
                      CDL: {d.licenseNumber}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-status-warning bg-status-warning/10 px-2 py-0.5 rounded-md border border-status-warning/20">
                  <Star className="w-3 h-3 fill-current" />
                  <span>{d.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-text-secondary pt-3 border-t border-border-subtle">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-text-muted" />
                  <span>{d.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-text-muted" />
                  <span>{d.email}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-text-muted">Completed Deliveries:</span>
                <span className="font-mono font-bold text-text-primary">
                  {d.deliveriesCompleted} Runs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vehicle Modal */}
      {isVehicleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
                <Truck className="w-5 h-5 text-cyan" />
                <span>Register Fleet Vehicle</span>
              </h3>
              <button
                onClick={() => setIsVehicleModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} className="space-y-3 text-xs">
              <div>
                <label className="text-text-secondary block mb-1">Registration Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. NX-TRK-905"
                  value={vehicleForm.registrationNumber}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, registrationNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Vehicle Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tesla Semi 2024 Long Range"
                  value={vehicleForm.model}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, model: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-secondary block mb-1">Vehicle Type</label>
                  <select
                    value={vehicleForm.vehicleType}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, vehicleType: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  >
                    <option value="Semi-Truck Electric">Semi-Truck Electric</option>
                    <option value="Delivery Van">Delivery Van</option>
                    <option value="Cargo Sprinter">Cargo Sprinter</option>
                    <option value="Heavy Freight Semi">Heavy Freight Semi</option>
                  </select>
                </div>

                <div>
                  <label className="text-text-secondary block mb-1">Telematics Feed</label>
                  <select
                    value={vehicleForm.telematicsProvider}
                    onChange={(e) =>
                      setVehicleForm({ ...vehicleForm, telematicsProvider: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  >
                    <option value="SAMSARA">Samsara</option>
                    <option value="GEOTAB">Geotab</option>
                    <option value="DEMO_TELEMATICS">Demo Telematics</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Assign Driver</label>
                <select
                  value={vehicleForm.driverId}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, driverId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                >
                  <option value="">Unassigned</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.licenseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-900 text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan text-navy-950 font-bold hover:bg-cyan/90 transition shadow-glow"
                >
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Driver Modal */}
      {isDriverModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-cyan/40 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-heading text-base font-bold text-text-primary flex items-center gap-2">
                <User className="w-5 h-5 text-cyan" />
                <span>Register CDL Driver</span>
              </h3>
              <button
                onClick={() => setIsDriverModalOpen(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDriver} className="space-y-3 text-xs">
              <div>
                <label className="text-text-secondary block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mateo Rodriguez"
                  value={driverForm.name}
                  onChange={(e) => setDriverForm({ ...driverForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mateo.r@nextrak.io"
                  value={driverForm.email}
                  onChange={(e) => setDriverForm({ ...driverForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Contact Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (312) 555-0189"
                  value={driverForm.phone}
                  onChange={(e) => setDriverForm({ ...driverForm, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              <div>
                <label className="text-text-secondary block mb-1">CDL License Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IL-CDL-88412-M"
                  value={driverForm.licenseNumber}
                  onChange={(e) =>
                    setDriverForm({ ...driverForm, licenseNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDriverModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-navy-900 text-text-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-cyan text-navy-950 font-bold hover:bg-cyan/90 transition shadow-glow"
                >
                  Save Driver Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

