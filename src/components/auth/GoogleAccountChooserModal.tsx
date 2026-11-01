"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  ChevronDown,
  Trash2,
  UserPlus,
  ShieldCheck,
  Check,
  Truck,
  Building,
  Key,
  Compass,
  Layers,
  MapPin,
  Lock,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";

export type OperationalRole =
  | "SUPER_ADMIN"
  | "DISPATCHER"
  | "FLEET_MANAGER"
  | "DRIVER"
  | "CUSTOMER";

export type GoogleFlowStage =
  | "CHOOSE_ACCOUNT"
  | "ENTER_EMAIL"
  | "ENTER_PASSWORD"
  | "OAUTH_CONSENT_AND_ROLE";

export interface GoogleUserOption {
  id?: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string | null;
  subLabel?: string;
  company?: string | null;
  metadata?: any;
}

interface GoogleAccountChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAccount?: (account: {
    email: string;
    name: string;
    avatarUrl: string;
    isNewUser: boolean;
    user?: any;
  }) => void;
  defaultRoleHint?: string;
}

// Authentic Google Material 3 Outlined Floating-Label Input
function GoogleFloatingInput({
  id,
  type = "text",
  label,
  value,
  onChange,
  error,
  autoFocus,
  onKeyDown,
  rightElement,
}: {
  id: string;
  type?: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string | null;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  rightElement?: React.ReactNode;
}) {
  const [isFocused, setIsFocused] = useState(false);
  const isFloating = isFocused || (value !== undefined && value !== null && value.length > 0);

  return (
    <div className="relative w-full">
      <div
        className={`relative rounded-[4px] border transition-colors ${
          error
            ? "border-[#ba1a1a]"
            : isFocused
            ? "border-[#0b57d0] ring-1 ring-[#0b57d0]"
            : "border-[#747775] hover:border-[#1f1f1f]"
        } bg-white flex items-center`}
      >
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={onKeyDown}
          autoFocus={autoFocus}
          className="w-full h-[54px] px-4 pt-3.5 pb-1 text-[#1f1f1f] text-[16px] bg-transparent outline-none rounded-[4px]"
        />
        {rightElement && (
          <div className="pr-3 flex items-center shrink-0">
            {rightElement}
          </div>
        )}
        <label
          htmlFor={id}
          className={`absolute left-3 transition-all duration-150 pointer-events-none px-1 bg-white font-normal ${
            error
              ? "text-[#ba1a1a]"
              : isFocused
              ? "text-[#0b57d0]"
              : "text-[#444746]"
          } ${
            isFloating
              ? "-top-2.5 text-[12px]"
              : "top-3.5 text-[16px]"
          }`}
        >
          {label}
        </label>
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-1.5 text-[12px] text-[#ba1a1a]">
          <svg className="w-3.5 h-3.5 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
          </svg>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// Official Google 4-Color 'G' Logo
function GoogleIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
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
  );
}

export function GoogleAccountChooserModal({
  isOpen,
  onClose,
  onSelectAccount,
  defaultRoleHint,
}: GoogleAccountChooserModalProps) {
  // 4-Stage State Machine
  const [stage, setStage] = useState<GoogleFlowStage>("CHOOSE_ACCOUNT");
  const [accounts, setAccounts] = useState<GoogleUserOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [customEmail, setCustomEmail] = useState("");
  const [customName, setCustomName] = useState("");
  const [customAvatar, setCustomAvatar] = useState("");
  const [password, setPassword] = useState("Nextrak@2026");
  const [showPassword, setShowPassword] = useState(false);

  // Role Selection State
  const [selectedRole, setSelectedRole] = useState<OperationalRole>(
    (defaultRoleHint as OperationalRole) || "SUPER_ADMIN"
  );
  // Contextual role parameters
  const [commandCenter, setCommandCenter] = useState("National Logistics Command — New Delhi");
  const [clearanceCode, setClearanceCode] = useState("NEXTRAK-ROOT-2026");
  const [assignedHub, setAssignedHub] = useState("Delhi NCR Hub");
  const [telemetryShift, setTelemetryShift] = useState("Shift A (06:00–14:00 IST)");
  const [baseDepot, setBaseDepot] = useState("Bhiwandi MMLP Depot");
  const [transporterGstin, setTransporterGstin] = useState("27AAACN1234F1Z5");
  const [licenseNumber, setLicenseNumber] = useState("MH-12-20240091234");
  const [assignedPlate, setAssignedPlate] = useState("MH-04-JK-9042");
  const [companyName, setCompanyName] = useState("Apollo Health Logistics");
  const [deliveryCity, setDeliveryCity] = useState("New Delhi");

  // Trigger Google Sliding Blue Progress Bar for transitions
  const triggerProgress = (cb?: () => void) => {
    setIsNavigating(true);
    setTimeout(() => {
      setIsNavigating(false);
      if (cb) cb();
    }, 350);
  };

  const fetchRegisteredAccounts = async () => {
    try {
      const res = await fetch("/api/auth/accounts");
      if (res.ok) {
        const data = await res.json();
        const accs: GoogleUserOption[] = data.accounts || [];
        setAccounts(accs);
        if (accs.length === 0) {
          setStage("ENTER_EMAIL");
        } else {
          setStage("CHOOSE_ACCOUNT");
        }
      } else {
        setStage("ENTER_EMAIL");
      }
    } catch {
      setStage("ENTER_EMAIL");
    }
  };

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setCustomEmail("");
      setCustomName("");
      setCustomAvatar("");
      setPassword("Nextrak@2026");
      setShowPassword(false);
      fetchRegisteredAccounts();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Account Deletion
  const handleDeleteAccount = async (e: React.MouseEvent, acc: GoogleUserOption) => {
    e.stopPropagation();
    if (!acc.id) return;
    if (!confirm(`Remove Google account ${acc.email}?`)) return;

    setDeletingId(acc.id);
    try {
      const res = await fetch(`/api/auth/accounts?id=${acc.id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((a) => a.id !== acc.id));
        if (accounts.length <= 1) {
          triggerProgress(() => setStage("ENTER_EMAIL"));
        }
      } else {
        setError("Failed to remove account.");
      }
    } catch {
      setError("Network failure deleting account.");
    } finally {
      setDeletingId(null);
    }
  };

  // 1-Click Select Existing Account
  const handleSelectExisting = (acc: GoogleUserOption) => {
    setCustomEmail(acc.email);
    setCustomName(acc.name);
    setCustomAvatar(acc.avatar || "");
    setPassword("Nextrak@2026");
    setShowPassword(false);
    setError(null);
    triggerProgress(() => {
      setStage("ENTER_PASSWORD");
    });
  };

  // Stage: ENTER_EMAIL -> "Next"
  const handleEmailNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!customEmail) {
      setError("Enter an email or phone number");
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(customEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setError(null);
    const computedName =
      customName.trim() ||
      customEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    setCustomName(computedName);

    const avatarUrl =
      customAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        computedName
      )}&backgroundColor=0b57d0`;
    setCustomAvatar(avatarUrl);
    setPassword("Nextrak@2026");
    setShowPassword(false);

    triggerProgress(() => {
      setStage("ENTER_PASSWORD");
    });
  };

  // Stage: ENTER_PASSWORD -> "Next"
  const handlePasswordNext = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError("Enter a password");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if user already exists in DB
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: customEmail,
          name: customName,
          avatarUrl: customAvatar,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (!data.isNewUser && data.user) {
          // Existing user -> Immediate Google login!
          if (typeof window !== "undefined") {
            localStorage.setItem("nextrak_user", JSON.stringify(data.user));
          }
          if (onSelectAccount) {
            onSelectAccount({
              email: customEmail,
              name: customName,
              avatarUrl: customAvatar,
              isNewUser: false,
              user: data.user,
            });
          }
          window.location.href = "/dashboard/shipments";
          return;
        }

        // New User -> Move directly to Stage 4: OAuth Consent & Role Selection
        triggerProgress(() => {
          setStage("OAUTH_CONSENT_AND_ROLE");
        });
      } else {
        setError(data.error || "Wrong password. Try again or click Forgot password to reset it.");
      }
    } catch {
      setError("Network error communicating with Google OAuth gateway.");
    } finally {
      setLoading(false);
    }
  };

  // Stage: OAUTH_CONSENT_AND_ROLE -> "Allow" / "Continue"
  const handleConsentAllow = async () => {
    setLoading(true);
    setError(null);

    const displayName =
      customName.trim() ||
      customEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const avatarUrl =
      customAvatar ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        displayName
      )}&backgroundColor=0b57d0`;

    // Construct role-specific metadata
    let metadata: Record<string, any> = {};
    let finalCompany = "";

    if (selectedRole === "SUPER_ADMIN") {
      metadata = { commandCenter, clearanceCode, jurisdiction: "Pan-India Sovereign Access" };
      finalCompany = "NEXTRAK National Command";
    } else if (selectedRole === "DISPATCHER") {
      metadata = { hub: assignedHub, shift: telemetryShift, corridor: "All Corridors" };
      finalCompany = assignedHub;
    } else if (selectedRole === "FLEET_MANAGER") {
      metadata = { depot: baseDepot, transporterGstin, fleetSize: "50+ Cryo Units" };
      finalCompany = baseDepot;
    } else if (selectedRole === "DRIVER") {
      metadata = { licenseNumber, assignedPlate, mobile: "+91 98201 55432" };
      finalCompany = "Multi-Axle Fleet";
    } else if (selectedRole === "CUSTOMER") {
      metadata = { organizationName: companyName, deliveryCity, freightType: "Pharmaceuticals" };
      finalCompany = companyName;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: displayName,
          email: customEmail,
          role: selectedRole,
          company: finalCompany,
          avatar: avatarUrl,
          authProvider: "GOOGLE",
          metadata,
        }),
      });

      const data = await res.json();
      if (res.ok && data.user) {
        if (typeof window !== "undefined") {
          localStorage.setItem("nextrak_user", JSON.stringify(data.user));
        }
        if (onSelectAccount) {
          onSelectAccount({
            email: customEmail,
            name: displayName,
            avatarUrl,
            isNewUser: false,
            user: data.user,
          });
        }
        window.location.href = "/dashboard/shipments";
      } else {
        setError(data.error || "Failed to finalize Google OAuth authorization.");
      }
    } catch {
      setError("Registration failed. Please check network connectivity.");
    } finally {
      setLoading(false);
    }
  };

  const roleDefinitions = [
    {
      role: "SUPER_ADMIN" as OperationalRole,
      title: "Super Admin",
      badge: "HQ Logistics Command",
      desc: "Full sovereign oversight, national corridor orchestration, master audit clearance",
      icon: ShieldCheck,
      color: "text-red-600 bg-red-50 border-red-200",
    },
    {
      role: "DISPATCHER" as OperationalRole,
      title: "Dispatcher",
      badge: "Multimodal Dispatch",
      desc: "Active consignment management, DFC rake and express air manifests",
      icon: Compass,
      color: "text-blue-600 bg-blue-50 border-blue-200",
    },
    {
      role: "FLEET_MANAGER" as OperationalRole,
      title: "Fleet Manager",
      badge: "Cold-Chain Reefer Fleet",
      desc: "Cryogenic telematics, depot turnaround, transporter FASTag tracking",
      icon: Truck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-200",
    },
    {
      role: "DRIVER" as OperationalRole,
      title: "Commercial Driver",
      badge: "In-Transit Telemetry",
      desc: "GPS checkpoint updates, reefer temperature verification & delivery PODs",
      icon: Key,
      color: "text-amber-600 bg-amber-50 border-amber-200",
    },
    {
      role: "CUSTOMER" as OperationalRole,
      title: "Customer / Shipper",
      badge: "Pharma Consignee",
      desc: "Hospital & distributor real-time ETA, temperature compliance certificates",
      icon: Building,
      color: "text-purple-600 bg-purple-50 border-purple-200",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in font-sans">
      <style>{`
        @keyframes googleIndeterminate {
          0% { transform: translateX(-100%) scaleX(0.2); }
          50% { transform: translateX(25%) scaleX(0.6); }
          100% { transform: translateX(120%) scaleX(0.2); }
        }
        .animate-google-indeterminate {
          animation: googleIndeterminate 1.1s infinite cubic-bezier(0.4, 0, 0.2, 1);
          transform-origin: left;
        }
      `}</style>

      {/* Main Google Material Design 3 Card (2-Column Desktop Layout) */}
      <div className="w-full max-w-[840px] min-h-[480px] bg-white text-[#1f1f1f] rounded-[28px] shadow-2xl overflow-hidden flex flex-col justify-between relative border border-[#dadce0]">
        
        {/* Top "Sign in with Google" Header Bar */}
        <div>
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#dadce0]">
            <div className="flex items-center gap-2.5">
              <GoogleIcon className="w-[18px] h-[18px] shrink-0" />
              <span className="text-[14px] font-medium text-[#5f6368]">
                Sign in with Google
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-[#5f6368] hover:bg-gray-100 rounded-full p-1.5 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Indeterminate Sliding Blue Progress Bar */}
          <div className="h-[4px] w-full bg-[#f0f4f9] overflow-hidden relative">
            {(isNavigating || loading) && (
              <div className="absolute top-0 bottom-0 left-0 bg-[#0b57d0] animate-google-indeterminate w-full" />
            )}
          </div>
        </div>

        {/* 2-Column Content Area */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 p-8 md:p-10 gap-8 items-start">
          
          {/* =========================================================
              LEFT COLUMN: GOOGLE LOGO, BIG TITLE & CONTEXT CHIP
             ========================================================= */}
          <div className="flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <GoogleIcon className="w-10 h-10" />

              {stage === "CHOOSE_ACCOUNT" && (
                <>
                  <h1 className="text-[28px] md:text-[32px] font-normal leading-tight text-[#1f1f1f]">
                    Choose an account
                  </h1>
                  <p className="text-[16px] text-[#444746]">
                    to continue to <span className="font-medium text-[#1f1f1f]">NEXTRAK India Logistics OS</span>
                  </p>
                </>
              )}

              {stage === "ENTER_EMAIL" && (
                <>
                  <h1 className="text-[28px] md:text-[32px] font-normal leading-tight text-[#1f1f1f]">
                    Sign in
                  </h1>
                  <p className="text-[16px] text-[#444746]">
                    to continue to <span className="font-medium text-[#1f1f1f]">NEXTRAK India Logistics OS</span>
                  </p>
                </>
              )}

              {stage === "ENTER_PASSWORD" && (
                <>
                  <h1 className="text-[28px] md:text-[32px] font-normal leading-tight text-[#1f1f1f]">
                    Welcome
                  </h1>
                  {/* Google User Email Pill Chip */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        triggerProgress(() => {
                          setStage(accounts.length > 0 ? "CHOOSE_ACCOUNT" : "ENTER_EMAIL");
                        });
                      }}
                      className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-[#747775] hover:bg-[#f2f2f2] transition-colors text-[14px] text-[#1f1f1f] font-medium"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-[#0b57d0] text-white text-[12px] font-medium flex items-center justify-center shrink-0">
                        {customAvatar ? (
                          <img src={customAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (customEmail[0] || "U").toUpperCase()
                        )}
                      </div>
                      <span className="truncate max-w-[190px]">{customEmail}</span>
                      <ChevronDown className="w-4 h-4 text-[#444746] shrink-0" />
                    </button>
                  </div>
                </>
              )}

              {stage === "OAUTH_CONSENT_AND_ROLE" && (
                <>
                  <div className="pb-1">
                    <div className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full border border-[#dadce0] bg-[#f8fafd] text-[13px] text-[#1f1f1f]">
                      <div className="w-5 h-5 rounded-full overflow-hidden bg-[#0b57d0] text-white text-[11px] font-medium flex items-center justify-center shrink-0">
                        {customAvatar ? (
                          <img src={customAvatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (customEmail[0] || "U").toUpperCase()
                        )}
                      </div>
                      <span className="truncate max-w-[180px] font-medium">{customEmail}</span>
                    </div>
                  </div>

                  <h1 className="text-[24px] md:text-[28px] font-normal leading-snug text-[#1f1f1f]">
                    NEXTRAK wants to access your Google Account
                  </h1>

                  <div className="space-y-2 pt-2">
                    <p className="text-[13px] font-medium text-[#444746]">
                      This allows NEXTRAK to:
                    </p>
                    <ul className="space-y-2 text-[13px] text-[#444746]">
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0b57d0] shrink-0 mt-0.5" />
                        <span>See your primary Google Account email address</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0b57d0] shrink-0 mt-0.5" />
                        <span>See your personal info, including profile name and picture</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-[#0b57d0] shrink-0 mt-0.5" />
                        <span>Associate you with cold-chain fleet and multimodal manifests</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Bottom Left Note / Brand Info */}
            <div className="hidden md:block pt-4">
              <div className="text-[12px] text-[#747775] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0b57d0]" />
                <span>Verified by Google Identity Services</span>
              </div>
            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: ACTIVE SCREEN FORMS & MD3 ACTIONS
             ========================================================= */}
          <div className="flex flex-col justify-between h-full min-h-[300px]">

            {/* SCREEN 1: "CHOOSE_ACCOUNT" */}
            {stage === "CHOOSE_ACCOUNT" && (
              <div className="flex flex-col justify-between h-full">
                <div className="space-y-1 max-h-[320px] overflow-y-auto pr-1">
                  {accounts.map((acc) => (
                    <div
                      key={acc.id || acc.email}
                      onClick={() => handleSelectExisting(acc)}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-[#f8fafd] transition-colors cursor-pointer group border border-transparent hover:border-[#dadce0]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {acc.avatar ? (
                          <img
                            src={acc.avatar}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-[#dadce0] shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#e8f0fe] text-[#0b57d0] font-semibold flex items-center justify-center shrink-0 text-sm">
                            {(acc.name || acc.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-[15px] font-medium text-[#1f1f1f] group-hover:text-[#0b57d0] truncate">
                            {acc.name}
                          </div>
                          <div className="text-[13px] text-[#444746] truncate">
                            {acc.email}
                          </div>
                          {acc.role && (
                            <span className="inline-block mt-0.5 text-[10px] font-medium uppercase px-2 py-0.5 rounded-full bg-[#f0f4f9] text-[#0b57d0]">
                              {acc.role.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>

                      {acc.id && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteAccount(e, acc)}
                          disabled={deletingId === acc.id}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-full text-[#747775] hover:text-[#ba1a1a] hover:bg-red-50 transition"
                          title="Remove saved account"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* "+ Use another account" Row */}
                  <div
                    onClick={() => {
                      triggerProgress(() => {
                        setCustomEmail("");
                        setCustomName("");
                        setStage("ENTER_EMAIL");
                      });
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#f8fafd] transition-colors cursor-pointer border border-transparent hover:border-[#dadce0] mt-1"
                  >
                    <div className="w-10 h-10 rounded-full border border-[#dadce0] text-[#444746] flex items-center justify-center shrink-0">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <span className="text-[15px] font-medium text-[#1f1f1f]">
                      Use another account
                    </span>
                  </div>
                </div>

                <div className="pt-6 text-[12px] text-[#747775]">
                  To continue, Google will share your name, email address, language preference, and profile picture with NEXTRAK.
                </div>
              </div>
            )}

            {/* SCREEN 2: "ENTER_EMAIL" */}
            {stage === "ENTER_EMAIL" && (
              <form onSubmit={handleEmailNext} className="flex flex-col justify-between h-full">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <GoogleFloatingInput
                      id="google-email-input"
                      type="email"
                      label="Email or phone"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        if (error) setError(null);
                      }}
                      error={error}
                      autoFocus
                    />

                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomEmail("operator@gmail.com");
                          if (error) setError(null);
                        }}
                        className="text-[14px] font-medium text-[#0b57d0] hover:underline"
                      >
                        Forgot email?
                      </button>
                    </div>
                  </div>

                  <div className="text-[14px] text-[#444746] leading-relaxed">
                    Not your computer? Use Guest mode to sign in privately.{" "}
                    <span className="text-[#0b57d0] font-medium cursor-pointer hover:underline">
                      Learn more about using Guest mode
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8">
                  {accounts.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => {
                        triggerProgress(() => setStage("CHOOSE_ACCOUNT"));
                      }}
                      className="text-[#0b57d0] font-medium text-[14px] hover:bg-[#f0f4f9] px-4 py-2 rounded-full transition-colors"
                    >
                      Switch account
                    </button>
                  ) : (
                    <span className="text-[13px] text-[#747775]">
                      Create account
                    </span>
                  )}

                  <button
                    type="submit"
                    disabled={loading || isNavigating}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-[14px] px-6 py-2.5 rounded-full transition-colors shadow-sm disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 3: "ENTER_PASSWORD" */}
            {stage === "ENTER_PASSWORD" && (
              <form onSubmit={handlePasswordNext} className="flex flex-col justify-between h-full">
                <div className="space-y-5">
                  <p className="text-[14px] text-[#444746]">
                    To continue, first verify it’s you
                  </p>

                  <div className="space-y-2">
                    <GoogleFloatingInput
                      id="google-password-input"
                      type={showPassword ? "text" : "password"}
                      label="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (error) setError(null);
                      }}
                      error={error}
                      autoFocus
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="p-1 rounded-full hover:bg-gray-100 text-[#5f6368] hover:text-[#1f1f1f] transition-colors focus:outline-none"
                          title={showPassword ? "Hide password" : "Show password"}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      }
                    />

                    <div className="flex items-center gap-2.5 pt-1.5">
                      <input
                        id="show-password-checkbox"
                        type="checkbox"
                        checked={showPassword}
                        onChange={(e) => setShowPassword(e.target.checked)}
                        className="w-4 h-4 rounded border-[#747775] text-[#0b57d0] focus:ring-[#0b57d0] cursor-pointer accent-[#0b57d0]"
                      />
                      <label
                        htmlFor="show-password-checkbox"
                        className="text-[14px] text-[#1f1f1f] cursor-pointer select-none font-normal"
                      >
                        Show password
                      </label>
                    </div>
                  </div>

                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setPassword("Nextrak@2026");
                        setShowPassword(true);
                      }}
                      className="text-[14px] font-medium text-[#0b57d0] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-8">
                  <button
                    type="button"
                    onClick={() => {
                      triggerProgress(() => {
                        setStage(accounts.length > 0 ? "CHOOSE_ACCOUNT" : "ENTER_EMAIL");
                      });
                    }}
                    className="text-[#0b57d0] font-medium text-[14px] hover:bg-[#f0f4f9] px-4 py-2 rounded-full transition-colors"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading || isNavigating}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-[14px] px-6 py-2.5 rounded-full transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Verifying..." : "Next"}
                  </button>
                </div>
              </form>
            )}

            {/* SCREEN 4: "OAUTH_CONSENT_AND_ROLE" */}
            {stage === "OAUTH_CONSENT_AND_ROLE" && (
              <div className="flex flex-col justify-between h-full space-y-4">
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  <div className="text-[13px] font-medium text-[#1f1f1f]">
                    Select your operational role in NEXTRAK:
                  </div>

                  {/* 5 Operational Role Cards */}
                  <div className="space-y-2">
                    {roleDefinitions.map((item) => {
                      const isSelected = selectedRole === item.role;
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.role}
                          onClick={() => setSelectedRole(item.role)}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "border-[#0b57d0] bg-[#f0f4f9] ring-1 ring-[#0b57d0]"
                              : "border-[#dadce0] hover:bg-[#f8fafd]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg border ${item.color}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-[14px] font-medium text-[#1f1f1f]">
                                  {item.title}
                                </span>
                                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-gray-100 text-[#444746]">
                                  {item.badge}
                                </span>
                              </div>
                              <p className="text-[12px] text-[#444746] mt-0.5">
                                {item.desc}
                              </p>
                            </div>
                          </div>

                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                            isSelected ? "border-[#0b57d0] bg-[#0b57d0]" : "border-[#747775]"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Contextual Input depending on role */}
                  <div className="pt-2">
                    {selectedRole === "CUSTOMER" && (
                      <GoogleFloatingInput
                        id="org-name-input"
                        label="Organization / Hospital Name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                      />
                    )}
                    {selectedRole === "DISPATCHER" && (
                      <GoogleFloatingInput
                        id="hub-name-input"
                        label="Assigned Multimodal Hub"
                        value={assignedHub}
                        onChange={(e) => setAssignedHub(e.target.value)}
                      />
                    )}
                    {selectedRole === "FLEET_MANAGER" && (
                      <GoogleFloatingInput
                        id="depot-name-input"
                        label="Base MMLP Depot"
                        value={baseDepot}
                        onChange={(e) => setBaseDepot(e.target.value)}
                      />
                    )}
                    {selectedRole === "DRIVER" && (
                      <GoogleFloatingInput
                        id="plate-name-input"
                        label="Assigned Vehicle Plate (FASTag)"
                        value={assignedPlate}
                        onChange={(e) => setAssignedPlate(e.target.value)}
                      />
                    )}
                    {selectedRole === "SUPER_ADMIN" && (
                      <GoogleFloatingInput
                        id="command-center-input"
                        label="Command Center Headquarters"
                        value={commandCenter}
                        onChange={(e) => setCommandCenter(e.target.value)}
                      />
                    )}
                  </div>

                  {error && (
                    <div className="p-2.5 rounded-lg bg-red-50 text-[#ba1a1a] text-[12px] border border-red-200">
                      {error}
                    </div>
                  )}

                  <div className="text-[11px] text-[#747775] leading-relaxed pt-1">
                    Make sure you trust NEXTRAK. You may be sharing sensitive info with this site or app. Learn about how NEXTRAK handles data in their Terms and Privacy Policies.
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-[#f2f2f2]">
                  <button
                    type="button"
                    onClick={() => {
                      triggerProgress(() => setStage("ENTER_PASSWORD"));
                    }}
                    className="text-[#0b57d0] font-medium text-[14px] hover:bg-[#f0f4f9] px-5 py-2.5 rounded-full transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleConsentAllow}
                    disabled={loading || isNavigating}
                    className="bg-[#0b57d0] hover:bg-[#0842a0] text-white font-medium text-[14px] px-7 py-2.5 rounded-full transition-colors shadow-sm disabled:opacity-50"
                  >
                    {loading ? "Authorizing..." : "Allow"}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* =========================================================
            BOTTOM CARD FOOTER: AUTHENTIC GOOGLE MD3 FOOTER
           ========================================================= */}
        <div className="px-8 py-3.5 bg-[#f8fafd] border-t border-[#dadce0] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#444746] gap-2">
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#1f1f1f]">
            <span>English (United States)</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#747775]" />
          </div>

          <div className="flex items-center gap-6">
            <span className="hover:text-[#1f1f1f] cursor-pointer">Help</span>
            <span className="hover:text-[#1f1f1f] cursor-pointer">Privacy</span>
            <span className="hover:text-[#1f1f1f] cursor-pointer">Terms</span>
          </div>
        </div>

      </div>
    </div>
  );
}
