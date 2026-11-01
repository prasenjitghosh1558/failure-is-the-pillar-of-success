"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Compass,
  Package,
  Truck,
  Route as RouteIcon,
  BarChart3,
  Bell,
  User,
  LogOut,
  ChevronDown,
  Layers,
  Shield,
  Menu,
  X,
  Radio,
  ExternalLink,
  Sun,
  Moon,
  UserPlus,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

interface RegisteredAccount {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  company?: string | null;
  phone?: string | null;
  authProvider?: string | null;
  subLabel?: string;
  parsedMetadata?: any;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, isDark } = useTheme();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accountSwitcherOpen, setAccountSwitcherOpen] = useState(false);
  const [accounts, setAccounts] = useState<RegisteredAccount[]>([]);
  const [switching, setSwitching] = useState(false);

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
          return;
        }
      }
      // Check localStorage fallback
      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("nextrak_user");
        if (stored) {
          try {
            const u = JSON.parse(stored);
            setCurrentUser(u);
            return;
          } catch {}
        }
      }
      setCurrentUser(null);
    } catch {
      setCurrentUser(null);
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/auth/accounts");
      if (res.ok) {
        const data = await res.json();
        if (data.accounts) {
          setAccounts(data.accounts);
        }
      }
    } catch {}
  };

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch {}
  };

  useEffect(() => {
    fetchSession();
    fetchAccounts();
    fetchNotifications();
  }, [pathname]);

  const handleSwitchAccount = async (email: string) => {
    setSwitching(true);
    try {
      const res = await fetch("/api/auth/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        setAccountSwitcherOpen(false);

        // Role-based navigation
        if (data.user?.role === "CUSTOMER") {
          router.push("/dashboard/shipments");
        } else {
          router.refresh();
        }
      }
    } catch (e) {
      console.error("Account switch error:", e);
    } finally {
      setSwitching(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setCurrentUser(null);
    router.push("/login");
  };

  const navigationItems = [
    { label: "India Command Matrix", href: "/dashboard/live-tracking", icon: Compass },
    { label: "Shipments Management", href: "/dashboard/shipments", icon: Package },
    { label: "Fleet & Corridors", href: "/dashboard/fleet", icon: Truck },
    { label: "Route Optimizer", href: "/dashboard/routes", icon: RouteIcon },
    { label: "Analytics & Reports", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "Notification Center", href: "/dashboard/notifications", icon: Bell, badge: unreadCount },
  ];

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    SUPER_ADMIN: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
    DISPATCHER: { bg: "bg-cyan/15", text: "text-cyan", border: "border-cyan/30" },
    FLEET_MANAGER: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    DRIVER: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    CUSTOMER: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  };

  const allOperationalRoles = [
    { role: "SUPER_ADMIN", label: "Super Admin" },
    { role: "DISPATCHER", label: "Dispatcher" },
    { role: "FLEET_MANAGER", label: "Fleet Manager" },
    { role: "DRIVER", label: "Commercial Driver" },
    { role: "CUSTOMER", label: "Customer / Shipper" },
  ];

  // Helper to get sub-label for current user
  const getUserSubLabel = (user: any) => {
    if (!user) return "";
    let meta: any = {};
    try {
      if (user.metadata) meta = typeof user.metadata === "string" ? JSON.parse(user.metadata) : user.metadata;
    } catch {}

    if (user.role === "SUPER_ADMIN") return meta.commandCenter || "National Logistics Command (New Delhi)";
    if (user.role === "DISPATCHER") return meta.hub ? `${meta.hub} • ${meta.shift || "Shift A"}` : "Delhi NCR Hub";
    if (user.role === "FLEET_MANAGER") return meta.depot ? `${meta.depot} • ${meta.fleetSize || "50+ Units"}` : "Bhiwandi MMLP Depot";
    if (user.role === "DRIVER") return meta.assignedPlate ? `Plate: ${meta.assignedPlate}` : "Multi-Axle HCV Fleet";
    if (user.role === "CUSTOMER") return meta.organizationName || user.company || "Tata Precision Auto Tech";
    return user.company || "";
  };

  return (
    <div className="flex h-screen overflow-hidden text-text-primary">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "w-64" : "w-20"
        } transition-all duration-300 border-r border-border-subtle bg-navy-950 flex flex-col justify-between shrink-0 z-30`}
      >
        <div>
          {/* Logo & Toggle */}
          <div className="h-16 border-b border-border-subtle flex items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-navy-900 border border-cyan/40 flex items-center justify-center text-cyan shadow-glow shrink-0">
                <Compass className="w-4 h-4 animate-pulse-slow" />
              </div>
              {isSidebarOpen && (
                <div className="flex flex-col">
                  <span className="font-heading font-bold text-base tracking-wider text-text-primary">
                    NEX<span className="text-cyan">TRAK</span>
                    <span className="ml-1 text-[9px] px-1 py-0.2 rounded bg-cyan/15 text-cyan font-mono">
                      IND
                    </span>
                  </span>
                  <span className="text-[8px] font-mono tracking-widest text-text-secondary uppercase -mt-0.5">
                    Operations OS
                  </span>
                </div>
              )}
            </Link>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-lg hover:bg-navy-850 text-text-secondary hover:text-text-primary transition"
            >
              {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-3 space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-navy-850 text-cyan border border-cyan/30 shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-navy-900"
                  }`}
                  title={item.label}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-cyan" : "text-text-muted group-hover:text-text-primary"
                    }`}
                  />
                  {isSidebarOpen && (
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate">{item.label}</span>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-1.5 py-0.2 rounded-full bg-status-error text-[10px] text-white font-mono">
                          {item.badge}
                        </span>
                      ) : null}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Google-Style Multi-Account Switcher & Profile Card */}
        <div className="p-3 border-t border-border-subtle bg-navy-950/90 relative">
          {/* Main User Card (Click to open Google Account Switcher) */}
          <div className="relative">
            <button
              onClick={() => {
                fetchAccounts();
                setAccountSwitcherOpen(!accountSwitcherOpen);
              }}
              className="w-full flex items-center gap-2.5 p-2 rounded-xl bg-navy-900 border border-border-subtle hover:border-cyan/50 text-xs text-left transition group"
            >
              {/* User Avatar */}
              {currentUser?.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover border border-cyan/40 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-cyan/20 border border-cyan/40 text-cyan flex items-center justify-center text-xs font-bold shrink-0">
                  {currentUser?.name?.slice(0, 1) || <User className="w-4 h-4" />}
                </div>
              )}

              {isSidebarOpen && (
                <div className="flex-1 truncate">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-heading font-semibold text-text-primary text-[11px] truncate group-hover:text-cyan transition">
                      {currentUser?.name || "Sign in with Google"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5 truncate">
                    {currentUser?.role ? (
                      <span
                        className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                          roleColors[currentUser?.role]?.bg || "bg-navy-850"
                        } ${roleColors[currentUser?.role]?.text || "text-cyan"} ${
                          roleColors[currentUser?.role]?.border || "border-cyan/30"
                        }`}
                      >
                        {currentUser.role}
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono text-cyan">
                        + Tap to Authenticate
                      </span>
                    )}
                    <span className="text-[9px] font-mono text-text-muted truncate">
                      {currentUser?.email || "No session active"}
                    </span>
                  </div>
                  {currentUser && (
                    <div className="text-[9px] text-text-secondary truncate mt-0.5">
                      {getUserSubLabel(currentUser)}
                    </div>
                  )}
                </div>
              )}

              {isSidebarOpen && (
                <ChevronDown
                  className={`w-3.5 h-3.5 text-text-muted group-hover:text-cyan transition-transform ${
                    accountSwitcherOpen ? "rotate-180" : ""
                  } shrink-0`}
                />
              )}
            </button>

            {/* Google-Style Multi-Account Popover Menu */}
            {accountSwitcherOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-2xl bg-[#0F172A] border border-cyan/40 shadow-2xl z-50 space-y-2.5 max-h-[480px] overflow-y-auto animate-fade-in w-72 -left-2 sm:left-0 sm:w-80">
                {/* Popover Header */}
                <div className="flex items-center justify-between px-2 pt-1 pb-2 border-b border-border-subtle">
                  <div className="flex items-center gap-1.5">
                    {/* Google G logo */}
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
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
                    <span className="font-heading font-bold text-xs text-text-primary">
                      Nextrak Multi-Account OS
                    </span>
                  </div>
                  <button
                    onClick={() => setAccountSwitcherOpen(false)}
                    className="text-text-muted hover:text-text-primary text-xs"
                  >
                    ✕
                  </button>
                </div>

                {/* + Register New Role / Add Account CTA */}
                <Link
                  href="/register"
                  onClick={() => setAccountSwitcherOpen(false)}
                  className="w-full p-2.5 rounded-xl border border-dashed border-cyan/50 hover:border-cyan hover:bg-cyan/10 text-cyan text-xs font-semibold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>+ Register New Role / Add Gmail</span>
                </Link>

                {/* Registered Accounts List */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 block">
                    Registered Accounts ({accounts.length})
                  </span>

                  {accounts.map((acc) => {
                    const isActive = currentUser?.email?.toLowerCase() === acc.email?.toLowerCase();
                    const badge = roleColors[acc.role] || {
                      bg: "bg-navy-800",
                      text: "text-text-secondary",
                      border: "border-border-subtle",
                    };

                    return (
                      <button
                        key={acc.id || acc.email}
                        type="button"
                        disabled={switching}
                        onClick={() => handleSwitchAccount(acc.email)}
                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between transition ${
                          isActive
                            ? "bg-navy-800 border border-cyan/40 text-cyan shadow-sm"
                            : "hover:bg-navy-850 text-text-secondary hover:text-text-primary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {acc.avatar ? (
                            <img
                              src={acc.avatar}
                              alt={acc.name}
                              className="w-7 h-7 rounded-full object-cover border border-border-subtle shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-cyan/20 text-cyan font-bold flex items-center justify-center text-xs shrink-0">
                              {acc.name?.charAt(0) || "U"}
                            </div>
                          )}

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-xs text-text-primary truncate">
                                {acc.name}
                              </span>
                              <span
                                className={`text-[8px] font-mono px-1 py-0.2 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                              >
                                {acc.role}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-text-muted truncate block">
                              {acc.email}
                            </span>
                            {acc.subLabel && (
                              <span className="text-[9px] text-text-secondary truncate block">
                                {acc.subLabel}
                              </span>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 ml-1.5" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* 5-Role Direct Matrix Switcher */}
                <div className="pt-2 border-t border-border-subtle space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted px-2 block">
                    Quick Role Matrix (All 5 Roles)
                  </span>

                  <div className="grid grid-cols-1 gap-1">
                    {allOperationalRoles.map((r) => {
                      // Check if we have an account registered for this role
                      const registeredAcc = accounts.find((a) => a.role === r.role);
                      const isCurrentRole = currentUser?.role === r.role;

                      return (
                        <div
                          key={r.role}
                          className="flex items-center justify-between px-2 py-1 rounded-lg text-xs hover:bg-navy-850 transition"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCurrentRole ? "bg-status-success animate-pulse" : "bg-text-muted"
                              }`}
                            />
                            <span className="text-text-primary font-medium">{r.label}</span>
                            <span className="text-[9px] font-mono text-text-muted">
                              ({r.role})
                            </span>
                          </div>

                          {registeredAcc ? (
                            <button
                              type="button"
                              onClick={() => handleSwitchAccount(registeredAcc.email)}
                              className="text-[10px] font-mono text-cyan hover:underline"
                            >
                              Switch
                            </button>
                          ) : (
                            <Link
                              href="/register"
                              onClick={() => setAccountSwitcherOpen(false)}
                              className="text-[10px] font-mono text-status-warning hover:underline"
                            >
                              + Register
                            </Link>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Popover Footer Links */}
                <div className="pt-2 border-t border-border-subtle flex items-center justify-between px-2 text-[11px]">
                  <Link
                    href="/track"
                    target="_blank"
                    className="text-text-muted hover:text-cyan transition flex items-center gap-1"
                  >
                    <span>Public Tracker</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="text-status-error hover:text-status-error/80 font-medium flex items-center gap-1 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Dedicated + Register Role Button below Card */}
          {isSidebarOpen && (
            <div className="mt-2.5 flex items-center gap-2">
              <Link
                href="/register"
                className="flex-1 py-1.5 px-2 rounded-xl bg-cyan/10 hover:bg-cyan/20 border border-cyan/40 text-cyan text-[11px] font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Register New Role</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-xl border border-border-subtle hover:border-status-error/40 hover:bg-status-error/10 text-text-muted hover:text-status-error transition"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-border-subtle bg-navy-950/90 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-status-success animate-pulse" />
              <span className="text-xs font-mono text-text-secondary uppercase tracking-wider">
                India Corridors Telemetry:{" "}
                <strong className="text-status-success">SYNCHRONIZED (FASTag / VTS)</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 border border-border-subtle hover:border-cyan/40 text-xs text-text-secondary hover:text-text-primary transition shadow-sm"
              title={`Switch to ${isDark ? "Enterprise High-Trust Light" : "Telemetry Dark"} Theme`}
            >
              {isDark ? (
                <>
                  <Sun className="w-4 h-4 text-status-warning" />
                  <span className="hidden sm:inline font-mono text-[11px]">Light Mode</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan" />
                  <span className="hidden sm:inline font-mono text-[11px]">Telemetry Dark</span>
                </>
              )}
            </button>

            {/* Notification Bell */}
            <Link
              href="/dashboard/notifications"
              className="relative p-2 rounded-xl bg-navy-900 border border-border-subtle hover:border-cyan/30 text-text-secondary hover:text-text-primary transition"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-status-error text-[9px] text-white flex items-center justify-center font-mono font-bold">
                  {unreadCount}
                </span>
              )}
            </Link>

            {/* Quick Track Link */}
            <Link
              href="/track"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-850 border border-border-subtle hover:border-cyan/30 text-xs text-text-primary font-medium transition"
            >
              <Package className="w-3.5 h-3.5 text-cyan" />
              <span>Public Tracking</span>
            </Link>

            {/* User Profile Pill in Header */}
            {currentUser && (
              <button
                onClick={() => {
                  fetchAccounts();
                  setAccountSwitcherOpen(true);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-navy-900 border border-cyan/30 hover:border-cyan transition text-xs"
              >
                {currentUser.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-cyan/20 text-cyan font-bold text-[10px] flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                )}
                <span className="font-medium text-text-primary hidden md:inline truncate max-w-[120px]">
                  {currentUser.name}
                </span>
                <span
                  className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase ${
                    roleColors[currentUser?.role]?.bg || "bg-navy-850"
                  } ${roleColors[currentUser?.role]?.text || "text-cyan"} ${
                    roleColors[currentUser?.role]?.border || "border-cyan/30"
                  }`}
                >
                  {currentUser.role}
                </span>
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
