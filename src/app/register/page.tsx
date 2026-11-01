"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Lock,
  Mail,
  User,
  Phone,
  Shield,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Truck,
  Package,
  Layers,
  Building,
  Key,
  CreditCard,
  FileText,
  Clock,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleAccountChooserModal } from "@/components/auth/GoogleAccountChooserModal";

export type OperationalRole =
  | "SUPER_ADMIN"
  | "DISPATCHER"
  | "FLEET_MANAGER"
  | "DRIVER"
  | "CUSTOMER";

export default function RegisterPage() {
  const router = useRouter();

  // Wizard Step (1: Identity & Gmail, 2: Role Selection, 3: Role Onboarding)
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Identity Form State (Step 1)
  const [authProvider, setAuthProvider] = useState<"GOOGLE" | "CREDENTIALS">("CREDENTIALS");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+91 ");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Role Selection State (Step 2)
  const [selectedRole, setSelectedRole] = useState<OperationalRole>("SUPER_ADMIN");

  // Role-Specific Onboarding State (Step 3)
  // SUPER_ADMIN fields
  const [commandCenter, setCommandCenter] = useState("National Logistics Command — New Delhi");
  const [clearanceCode, setClearanceCode] = useState("NEXTRAK-ROOT-2026");
  const [jurisdiction, setJurisdiction] = useState(
    "All 28 States & 8 UTs (Pan-India Sovereign Access)"
  );
  const [adminPhone, setAdminPhone] = useState("+91 98100 23456");

  // DISPATCHER fields
  const [assignedHub, setAssignedHub] = useState("Delhi NCR Hub");
  const [telemetryShift, setTelemetryShift] = useState("Shift A (06:00–14:00 IST)");
  const [corridorResponsibility, setCorridorResponsibility] = useState("All Corridors");
  const [dispatcherId, setDispatcherId] = useState("DISP-IND-402");

  // FLEET_MANAGER fields
  const [baseDepot, setBaseDepot] = useState("Bhiwandi MMLP");
  const [fleetSize, setFleetSize] = useState("26–100 Vehicles");
  const [transporterGstin, setTransporterGstin] = useState("27AAACN1234F1Z5");
  const [fastagBank, setFastagBank] = useState("ICICI Bank FASTag");

  // DRIVER fields
  const [licenseNumber, setLicenseNumber] = useState("MH-12-20190084920");
  const [assignedPlate, setAssignedPlate] = useState("MH-04-JK-9042");
  const [cargoCert, setCargoCert] = useState("Heavy Goods Vehicle (HGV)");
  const [driverContact, setDriverContact] = useState("+91 98201 55432");

  // CUSTOMER fields
  const [companyName, setCompanyName] = useState("Tata Precision Auto Tech");
  const [customerGstin, setCustomerGstin] = useState("36AABCU9603R1ZM");
  const [deliveryCity, setDeliveryCity] = useState("Pune");
  const [freightCategory, setFreightCategory] = useState("Pharmaceuticals & Biologics");

  // Google Modal handler
  const handleGoogleAccountSelected = (account: {
    email: string;
    name: string;
    avatarUrl: string;
    isNewUser: boolean;
    user?: any;
  }) => {
    setShowGoogleModal(false);
    if (!account.isNewUser && account.user) {
      // Returning user -> redirect directly into dashboard
      if (typeof window !== "undefined") {
        localStorage.setItem("nextrak_user", JSON.stringify(account.user));
      }
      window.location.href = "/dashboard/shipments";
      return;
    }

    // New user -> populate identity & advance to Step 2
    setName(account.name);
    setEmail(account.email);
    setAvatarUrl(account.avatarUrl);
    setAuthProvider("GOOGLE");
    setStep(2);
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setError("Please fill in your name and email.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleFinalRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Build role-specific metadata
    let metadata: Record<string, any> = {};
    let finalCompany = "";

    if (selectedRole === "SUPER_ADMIN") {
      metadata = {
        commandCenter,
        clearanceCode,
        jurisdiction,
        emergencyPhone: adminPhone,
      };
      finalCompany = commandCenter;
    } else if (selectedRole === "DISPATCHER") {
      metadata = {
        hub: assignedHub,
        shift: telemetryShift,
        corridor: corridorResponsibility,
        dispatcherId,
      };
      finalCompany = `${assignedHub} Dispatch Operations`;
    } else if (selectedRole === "FLEET_MANAGER") {
      metadata = {
        depot: baseDepot,
        fleetSize,
        gstin: transporterGstin,
        fastagBank,
      };
      finalCompany = `${baseDepot} Fleet Transport Corp`;
    } else if (selectedRole === "DRIVER") {
      metadata = {
        licenseNumber,
        assignedPlate,
        cargoCertification: cargoCert,
        driverContact,
      };
      finalCompany = `Transit Carrier • Plate: ${assignedPlate}`;
    } else if (selectedRole === "CUSTOMER") {
      metadata = {
        organizationName: companyName,
        gstin: customerGstin,
        deliveryCity,
        freightCategory,
      };
      finalCompany = companyName;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password: password || undefined,
          role: selectedRole,
          phone: phone.trim() !== "+91" ? phone : adminPhone || driverContact,
          company: finalCompany,
          avatar: avatarUrl,
          authProvider,
          metadata,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (typeof window !== "undefined" && data.user) {
          localStorage.setItem("nextrak_user", JSON.stringify(data.user));
        }
        window.location.href = "/dashboard/shipments";
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch {
      setError("Failed to communicate with authentication gateway.");
    } finally {
      setLoading(false);
    }
  };

  const roleDefinitions: {
    role: OperationalRole;
    title: string;
    subtitle: string;
    desc: string;
    badgeColor: string;
    icon: any;
    highlights: string[];
  }[] = [
    {
      role: "SUPER_ADMIN",
      title: "Super Admin",
      subtitle: "National Command Matrix",
      desc: "Full sovereign command across all 28 States & 8 UTs, system config & security audit control.",
      badgeColor: "text-red-400 bg-red-500/10 border-red-500/30",
      icon: Shield,
      highlights: [
        "Pan-India sovereign corridor control",
        "Full user & role provisioning",
        "Cryptographic audit log inspector",
      ],
    },
    {
      role: "DISPATCHER",
      title: "Regional Dispatcher",
      subtitle: "Multi-Hub Cargo Traffic",
      desc: "Live consignment creation, DFC heavy rail / highway route scheduling & TSP path calculation.",
      badgeColor: "text-cyan bg-cyan/10 border-cyan/30",
      icon: Compass,
      highlights: [
        "Live shipment consignment creation",
        "Multi-stop TSP route planning",
        "Monsoon ghat alert management",
      ],
    },
    {
      role: "FLEET_MANAGER",
      title: "Fleet Manager",
      subtitle: "Depots & Reefer Telemetry",
      desc: "Commercial HCV asset maintenance, -20°C cold-chain sensors, FASTag toll balance & depot dispatch.",
      badgeColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      icon: Truck,
      highlights: [
        "Cold-chain temperature logging",
        "Vehicle health & FASTag balance",
        "Driver fleet manifest allocation",
      ],
    },
    {
      role: "DRIVER",
      title: "Commercial Driver",
      subtitle: "In-Transit Highway Navigation",
      desc: "Mobile consignment manifest, highway checkpoint check-in, E-Way Bill inspection & delivery signoff.",
      badgeColor: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      icon: MapPin,
      highlights: [
        "Turn-by-turn Indian corridor telemetry",
        "Toll plaza FASTag auto-confirmation",
        "Digital ePOD delivery signature",
      ],
    },
    {
      role: "CUSTOMER",
      title: "Consignee / Shipper",
      subtitle: "Enterprise Cargo Booking",
      desc: "Direct consignment booking, live milestone tracking, GST e-invoices & proof of delivery.",
      badgeColor: "text-purple-400 bg-purple-500/10 border-purple-500/30",
      icon: Package,
      highlights: [
        "Real-time GPS consignment radar",
        "E-Way bill & GST invoice downloads",
        "Automated WhatsApp delivery alerts",
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-navy-950">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Step Indicator Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-cyan/30 text-xs font-mono text-cyan">
            <Sparkles className="w-3.5 h-3.5 text-cyan" />
            <span>Multi-Role Indian Logistics Onboarding</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-text-primary">
            Register Your NEXTRAK Role Account
          </h1>
          <p className="text-xs text-text-secondary max-w-lg mx-auto">
            Step through our 3-step onboarding wizard to register Super Admin, Dispatcher,
            Fleet Manager, Driver, and Customer roles with Google or credentials.
          </p>

          {/* Stepper Progress Pills */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition ${
                step === 1
                  ? "bg-cyan/20 border-cyan text-cyan font-bold"
                  : step > 1
                  ? "bg-navy-900 border-status-success text-status-success"
                  : "bg-navy-900 border-border-subtle text-text-muted"
              }`}
            >
              <span>1</span>
              <span>Identity & Gmail</span>
            </div>
            <div className="w-6 h-0.5 bg-border-subtle" />
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition ${
                step === 2
                  ? "bg-cyan/20 border-cyan text-cyan font-bold"
                  : step > 2
                  ? "bg-navy-900 border-status-success text-status-success"
                  : "bg-navy-900 border-border-subtle text-text-muted"
              }`}
            >
              <span>2</span>
              <span>Select 1-of-5 Roles</span>
            </div>
            <div className="w-6 h-0.5 bg-border-subtle" />
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition ${
                step === 3
                  ? "bg-cyan/20 border-cyan text-cyan font-bold"
                  : "bg-navy-900 border-border-subtle text-text-muted"
              }`}
            >
              <span>3</span>
              <span>Role Onboarding</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-status-error/15 border border-status-error/30 text-status-error text-xs flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="text-text-muted hover:text-white">
              ✕
            </button>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 1: IDENTITY & GMAIL AUTHENTICATION                  */}
        {/* ======================================================== */}
        {step === 1 && (
          <div className="max-w-xl mx-auto glass-panel-glow p-8 rounded-2xl border border-cyan/30 shadow-2xl space-y-6">
            <div className="text-center space-y-1">
              <h3 className="font-heading text-lg font-bold text-text-primary">
                Step 1: Authenticate Your Identity
              </h3>
              <p className="text-xs text-text-secondary">
                Connect via Google / Gmail for 1-click verification or fill in standard credentials.
              </p>
            </div>

            {/* Primary Google / Gmail Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs shadow-md transition flex items-center justify-center gap-3 border border-slate-200"
            >
              {/* Google 4-color SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google / Sign in with Gmail</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-[10px] font-mono uppercase text-text-muted">
                Or Register with Corporate Credentials
              </span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            <form onSubmit={handleStep1Submit} className="space-y-4 text-xs">
              <div>
                <label className="text-text-secondary block mb-1">Full Legal Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vikramaditya Singhal"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@logistics-india.com or user@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">
                  Mobile Number (+91 WhatsApp / Telemetry)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Account Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2 mt-2"
              >
                <span>Continue to Step 2: Role Selection</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-text-secondary">
              Already have an account?{" "}
              <Link href="/login" className="text-cyan font-semibold hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 2: ROLE SELECTION MATRIX (1-by-1 Role Picker)      */}
        {/* ======================================================== */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <h3 className="font-heading text-lg font-bold text-text-primary">
                  Step 2: Select Operational Role Matrix
                </h3>
                <p className="text-xs text-text-secondary">
                  Choose which of the 5 NEXTRAK operational roles you are registering for{" "}
                  <strong className="text-cyan">({email})</strong>.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-navy-900 text-xs text-text-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            </div>

            {/* 5-Role Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roleDefinitions.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedRole === item.role;

                return (
                  <div
                    key={item.role}
                    onClick={() => setSelectedRole(item.role)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-navy-850/90 border-cyan ring-2 ring-cyan/40 shadow-glow"
                        : "glass-panel border-border-subtle hover:border-cyan/40 hover:bg-navy-900"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-navy-900 border border-border-subtle flex items-center justify-center text-cyan">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${item.badgeColor}`}
                        >
                          {item.role}
                        </span>
                      </div>

                      <div>
                        <h4 className="font-heading font-bold text-sm text-text-primary">
                          {item.title}
                        </h4>
                        <span className="text-[11px] font-mono text-cyan block mb-1">
                          {item.subtitle}
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border-subtle space-y-1">
                        {item.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-[11px] text-text-muted">
                            <CheckCircle2 className="w-3 h-3 text-status-success shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs">
                      <span className="text-text-secondary">
                        {isSelected ? "Role Selected" : "Click to Select"}
                      </span>
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center border transition ${
                          isSelected
                            ? "bg-cyan border-cyan text-navy-950"
                            : "border-border-subtle bg-navy-900 text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Advance to Step 3 CTA */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="py-3 px-8 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center gap-2"
              >
                <span>Continue to Step 3: Role Onboarding ({selectedRole})</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STEP 3: ROLE-SPECIFIC ONBOARDING (Dynamic Form)         */}
        {/* ======================================================== */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto glass-panel-glow p-8 rounded-2xl border border-cyan/30 shadow-2xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading text-lg font-bold text-text-primary">
                    Step 3: {selectedRole} Onboarding & Compliance
                  </h3>
                </div>
                <p className="text-xs text-text-secondary">
                  Complete the sovereign operational fields for your assigned Indian logistics role.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-subtle hover:bg-navy-900 text-xs text-text-secondary"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Role</span>
              </button>
            </div>

            <form onSubmit={handleFinalRegistration} className="space-y-4 text-xs">
              {/* Dynamic Form Sections based on selectedRole */}

              {/* 1. SUPER_ADMIN FIELDS */}
              {selectedRole === "SUPER_ADMIN" && (
                <>
                  <div>
                    <label className="text-text-secondary block mb-1">
                      National Command Center Designation *
                    </label>
                    <input
                      type="text"
                      required
                      value={commandCenter}
                      onChange={(e) => setCommandCenter(e.target.value)}
                      placeholder="e.g. National Logistics Command — New Delhi"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-text-secondary">
                        Admin Authorization / Clearance Code *
                      </label>
                      <span className="text-[10px] text-cyan font-mono">
                        Hint: NEXTRAK-ROOT-2026
                      </span>
                    </div>
                    <div className="relative">
                      <Key className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={clearanceCode}
                        onChange={(e) => setClearanceCode(e.target.value)}
                        placeholder="NEXTRAK-ROOT-2026"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Primary Sovereign Jurisdiction
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={jurisdiction}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900/60 border border-border-subtle text-cyan font-mono focus:outline-none cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Emergency Alert Phone Number (+91)
                    </label>
                    <input
                      type="text"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      placeholder="+91 98100 23456"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* 2. DISPATCHER FIELDS */}
              {selectedRole === "DISPATCHER" && (
                <>
                  <div>
                    <label className="text-text-secondary block mb-1">
                      Assigned Regional Operations Hub *
                    </label>
                    <select
                      value={assignedHub}
                      onChange={(e) => setAssignedHub(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="Delhi NCR Hub">Delhi NCR Hub (Rewari / Dadri)</option>
                      <option value="Mumbai JNPT">Mumbai JNPT Port Terminal</option>
                      <option value="Nagpur Zero-Mile">Nagpur Zero-Mile Multi-Modal Hub</option>
                      <option value="Kolkata Port">Kolkata Port & Syama Prasad Mookerjee Dock</option>
                      <option value="Chennai Port">Chennai Port Corridor</option>
                      <option value="Bengaluru Hub">Bengaluru Devanahalli Hub</option>
                      <option value="Guwahati NE Corridor">Guwahati North-East Gate</option>
                      <option value="Hyderabad Hub">Hyderabad Genome Valley Hub</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Active Telemetry Shift *
                    </label>
                    <select
                      value={telemetryShift}
                      onChange={(e) => setTelemetryShift(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="Shift A (06:00–14:00 IST)">Shift A (06:00–14:00 IST)</option>
                      <option value="Shift B (14:00–22:00 IST)">Shift B (14:00–22:00 IST)</option>
                      <option value="Night Command (22:00–06:00 IST)">
                        Night Command (22:00–06:00 IST)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Primary Corridor Responsibility *
                    </label>
                    <select
                      value={corridorResponsibility}
                      onChange={(e) => setCorridorResponsibility(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="All Corridors">All Corridors (Pan-India)</option>
                      <option value="WDFC / EDFC Heavy Rail">WDFC / EDFC Heavy Rail Lines</option>
                      <option value="Golden Quadrilateral (NH-44/48)">
                        Golden Quadrilateral (NH-44 / NH-48)
                      </option>
                      <option value="Pharma Cold-Chain (-20°C)">
                        Pharma Cold-Chain (-20°C Reefer)
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Dispatcher Employee ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={dispatcherId}
                      onChange={(e) => setDispatcherId(e.target.value)}
                      placeholder="DISP-IND-402"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono"
                    />
                  </div>
                </>
              )}

              {/* 3. FLEET_MANAGER FIELDS */}
              {selectedRole === "FLEET_MANAGER" && (
                <>
                  <div>
                    <label className="text-text-secondary block mb-1">
                      Base Depot / MMLP (Multimodal Logistics Park) *
                    </label>
                    <select
                      value={baseDepot}
                      onChange={(e) => setBaseDepot(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="Bhiwandi MMLP">Bhiwandi MMLP (Maharashtra)</option>
                      <option value="Dadri ICD">Dadri ICD (Greater Noida)</option>
                      <option value="Tughlakabad Terminal">Tughlakabad Container Terminal</option>
                      <option value="Sriperumbudur Depot">Sriperumbudur Auto Depot (Tamil Nadu)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Fleet Size Under Management *
                    </label>
                    <select
                      value={fleetSize}
                      onChange={(e) => setFleetSize(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="1–25 Vehicles">1–25 Commercial HCV Units</option>
                      <option value="26–100 Vehicles">26–100 Multi-Axle & Reefer Fleet</option>
                      <option value="100+ HCV & Reefer Units">100+ HCV & Heavy Reefer Units</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Transporter GSTIN / Carrier ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={transporterGstin}
                      onChange={(e) => setTransporterGstin(e.target.value)}
                      placeholder="27AAACN1234F1Z5"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      FASTag Corporate Issuer Bank *
                    </label>
                    <select
                      value={fastagBank}
                      onChange={(e) => setFastagBank(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="ICICI Bank FASTag">ICICI Bank Commercial FASTag</option>
                      <option value="HDFC Fleet Tag">HDFC Fleet Highway Tag</option>
                      <option value="Axis Highway Tag">Axis Highway Logistics Tag</option>
                      <option value="SBI NHAI Tag">SBI NHAI Corporate Tag</option>
                    </select>
                  </div>
                </>
              )}

              {/* 4. DRIVER FIELDS */}
              {selectedRole === "DRIVER" && (
                <>
                  <div>
                    <label className="text-text-secondary block mb-1">
                      Indian Commercial Driving License (DL) Number *
                    </label>
                    <input
                      type="text"
                      required
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="MH-12-20190084920"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Vehicle Registration Plate Assigned *
                    </label>
                    <input
                      type="text"
                      required
                      value={assignedPlate}
                      onChange={(e) => setAssignedPlate(e.target.value)}
                      placeholder="MH-04-JK-9042 or DL-01-GC-4410"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Vehicle & Cargo Certification *
                    </label>
                    <select
                      value={cargoCert}
                      onChange={(e) => setCargoCert(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="Heavy Goods Vehicle (HGV)">Heavy Goods Vehicle (HGV)</option>
                      <option value="Cryogenic Pharma Reefer (-20°C)">
                        Cryogenic Pharma Reefer (-20°C)
                      </option>
                      <option value="Port Container Trailer">Port Container Trailer (JNPT)</option>
                      <option value="Hazmat Certified">Hazmat Certified (Petrochemicals)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Driver WhatsApp / Telemetry Contact *
                    </label>
                    <input
                      type="text"
                      required
                      value={driverContact}
                      onChange={(e) => setDriverContact(e.target.value)}
                      placeholder="+91 98201 55432"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    />
                  </div>
                </>
              )}

              {/* 5. CUSTOMER FIELDS */}
              {selectedRole === "CUSTOMER" && (
                <>
                  <div>
                    <label className="text-text-secondary block mb-1">
                      Organization / Consignee Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Tata Precision Auto Tech or Bharat Pharma"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Company GSTIN (for E-Way Bill Auto-Sync) *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerGstin}
                      onChange={(e) => setCustomerGstin(e.target.value)}
                      placeholder="36AABCU9603R1ZM"
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Primary Delivery City / Warehouse Hub *
                    </label>
                    <select
                      value={deliveryCity}
                      onChange={(e) => setDeliveryCity(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="Mumbai">Mumbai (JNPT Industrial Belt)</option>
                      <option value="Pune">Pune (Chakan Auto Corridor)</option>
                      <option value="Delhi NCR">Delhi NCR (Gurugram / Noida)</option>
                      <option value="Bengaluru">Bengaluru (Electronic City)</option>
                      <option value="Chennai">Chennai (Sriperumbudur Hub)</option>
                      <option value="Hyderabad">Hyderabad (Genome Valley)</option>
                      <option value="Kolkata">Kolkata (Dankuni Freight Hub)</option>
                      <option value="Ahmedabad">Ahmedabad (Sanand Corridor)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-text-secondary block mb-1">
                      Default Freight Category *
                    </label>
                    <select
                      value={freightCategory}
                      onChange={(e) => setFreightCategory(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                    >
                      <option value="Pharmaceuticals & Biologics">
                        Pharmaceuticals & Biologics
                      </option>
                      <option value="Semiconductors & Electronics">
                        Semiconductors & Electronics
                      </option>
                      <option value="Heavy Industrial & Steel">Heavy Industrial & Steel</option>
                      <option value="FMCG & Retail">FMCG & Retail Goods</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2 mt-6"
              >
                <span>
                  {loading
                    ? "Provisioning Role & Syncing Prisma DB..."
                    : `Complete Registration & Launch OS as ${selectedRole}`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Google Account Chooser Modal Component */}
      <GoogleAccountChooserModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />

      <Footer />
    </div>
  );
}

