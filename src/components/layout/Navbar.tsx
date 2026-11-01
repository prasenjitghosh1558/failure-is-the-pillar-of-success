"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Package,
  Truck,
  Route as RouteIcon,
  BarChart3,
  Bell,
  User,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  Sun,
  Moon,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme, isDark } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.authenticated) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const navLinks = [
    { label: "Track Consignment", href: "/track", icon: Package },
    { label: "India Medical Matrix", href: "/dashboard/live-tracking", icon: Compass },
    { label: "Vaccine Manifests", href: "/dashboard/shipments", icon: Package },
    { label: "Reefer Fleets", href: "/dashboard/fleet", icon: Truck },
    { label: "Hospital Route Planner", href: "/dashboard/routes", icon: RouteIcon },
    { label: "Cold-Chain Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border-subtle bg-[var(--nav-bg)] backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan via-purple-accent to-blue-500 p-0.5 shadow-glow group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-navy-950 rounded-[7px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan animate-pulse-slow" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg tracking-wider text-text-primary flex items-center">
                NEX<span className="text-cyan">TRAK</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded bg-cyan/15 text-cyan font-mono font-normal">
                  PharmaOS
                </span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-text-secondary uppercase -mt-1">
                Medical & Vaccine Cold-Chain OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? "bg-navy-850 text-cyan border border-cyan/30 shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-navy-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Action Items */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Dual-Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-navy-900 border border-border-subtle hover:border-cyan/40 text-xs text-text-secondary hover:text-text-primary transition shadow-sm"
            title={`Switch to ${isDark ? "Enterprise High-Trust Light" : "Telemetry Dark"} Theme`}
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-status-warning" />
                <span className="font-mono text-[11px]">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-cyan" />
                <span className="font-mono text-[11px]">Telemetry Dark</span>
              </>
            )}
          </button>

          {/* Real-time Telemetry Status Pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-navy-900 border border-border-subtle text-xs text-text-secondary">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="font-mono text-[11px] text-text-primary">CDSCO / WHO-GDP Live</span>
          </div>

          {currentUser ? (
            <Link
              href="/dashboard/shipments"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-850 border border-border-subtle hover:border-cyan/30 transition text-xs text-text-primary"
            >
              <div className="w-5 h-5 rounded-full bg-cyan/20 text-cyan flex items-center justify-center text-[10px] font-bold">
                {currentUser.name.slice(0, 1)}
              </div>
              <span className="font-medium">{currentUser.name}</span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-navy-900 text-cyan font-mono">
                {currentUser.role}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-900 border border-border-subtle hover:border-cyan/30 text-text-primary text-xs font-medium transition"
              >
                <User className="w-3.5 h-3.5 text-cyan" />
                <span>Sign In</span>
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan text-navy-950 font-semibold text-xs hover:bg-cyan/90 transition shadow-glow"
              >
                <span>+ Register Role</span>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex lg:hidden items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-navy-900 border border-border-subtle text-text-secondary"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-4 h-4 text-status-warning" /> : <Moon className="w-4 h-4 text-cyan" />}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-navy-900 border border-border-subtle text-text-secondary hover:text-text-primary"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-border-subtle bg-[var(--nav-bg)] px-4 pt-2 pb-6 space-y-2 backdrop-blur-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-navy-850 text-cyan border border-cyan/30"
                    : "text-text-secondary hover:text-text-primary hover:bg-navy-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-border-subtle flex flex-col gap-2">
            <Link
              href="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-cyan text-navy-950 font-semibold text-xs"
            >
              + Register New Role Account
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 rounded-lg bg-navy-900 border border-border-subtle text-text-primary font-medium text-xs"
            >
              Access Dashboard / Role Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
