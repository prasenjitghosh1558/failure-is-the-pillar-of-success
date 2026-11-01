"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  User,
  Zap,
  Sparkles,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GoogleAccountChooserModal } from "@/components/auth/GoogleAccountChooserModal";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const fetchAccounts = async () => {
    setLoadingAccounts(true);
    try {
      const res = await fetch("/api/auth/accounts");
      if (res.ok) {
        const data = await res.json();
        setUserAccounts(data.accounts || []);
      }
    } catch {
      setUserAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
    setLoading(true);
    setError(null);
    const targetEmail = loginEmail || email;
    const targetPassword = loginPassword || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        if (typeof window !== "undefined" && data.user) {
          localStorage.setItem("nextrak_user", JSON.stringify(data.user));
        }
        window.location.href = "/dashboard/shipments";
      } else {
        setError(data.error || "Login credentials failed.");
      }
    } catch {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAccountSelected = (account: {
    email: string;
    name: string;
    avatarUrl: string;
    isNewUser: boolean;
    user?: any;
  }) => {
    setShowGoogleModal(false);
    if (!account.isNewUser && account.user) {
      if (typeof window !== "undefined") {
        localStorage.setItem("nextrak_user", JSON.stringify(account.user));
      }
      window.location.href = "/dashboard/shipments";
    } else {
      router.push("/register");
    }
  };

  const roleColors: Record<string, { bg: string; text: string; border: string }> = {
    SUPER_ADMIN: { bg: "bg-red-500/15", text: "text-red-400", border: "border-red-500/30" },
    DISPATCHER: { bg: "bg-cyan/15", text: "text-cyan", border: "border-cyan/30" },
    FLEET_MANAGER: { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
    DRIVER: { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
    CUSTOMER: { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  };

  return (
    <div className="flex flex-col min-h-screen bg-navy-950">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-900 border border-cyan/30 text-xs font-mono text-cyan">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Authentication & Sovereign RBAC</span>
          </div>
          <h1 className="font-heading text-3xl font-extrabold text-text-primary">
            Sign In to NEXTRAK Operations OS
          </h1>
          <p className="text-xs text-text-secondary max-w-md mx-auto">
            Sign in with Google / Gmail, select your saved account, or register a new operational role.
          </p>
        </div>

        {/* Top Google & Register Quick Banner */}
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-2xl glass-panel border border-cyan/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan/15 border border-cyan/30 flex items-center justify-center text-cyan shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse-slow" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs text-text-primary block">
                Sign in with Google or Add a New Role
              </span>
              <span className="text-[11px] text-text-secondary">
                Connect your Gmail to Super Admin, Dispatcher, Fleet Manager, Driver, or Customer.
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowGoogleModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2"
            >
              <span>Sign in with Google</span>
            </button>
            <Link
              href="/register"
              className="px-4 py-2.5 rounded-xl bg-navy-900 border border-cyan/40 text-cyan hover:bg-navy-850 font-heading font-bold text-xs transition flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* User Created Accounts List (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
              <span className="font-heading text-xs uppercase font-semibold text-text-secondary tracking-wider">
                Saved User Accounts ({userAccounts.length})
              </span>
              <span className="text-[10px] text-cyan font-mono">1-Click Instant Login</span>
            </div>

            {loadingAccounts ? (
              <div className="glass-panel p-8 rounded-xl border border-border-subtle text-center text-xs text-text-muted">
                Loading accounts...
              </div>
            ) : userAccounts.length > 0 ? (
              <div className="space-y-3">
                {userAccounts.map((acc) => {
                  const badge = roleColors[acc.role] || {
                    bg: "bg-navy-800",
                    text: "text-text-secondary",
                    border: "border-border-subtle",
                  };

                  return (
                    <div
                      key={acc.id || acc.email}
                      onClick={() => {
                        setEmail(acc.email);
                        // Trigger Google login or account switch
                        fetch("/api/auth/google", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ email: acc.email }),
                        })
                          .then((r) => r.json())
                          .then((d) => {
                            if (d.user) {
                              localStorage.setItem("nextrak_user", JSON.stringify(d.user));
                              window.location.href = "/dashboard/shipments";
                            }
                          });
                      }}
                      className="glass-panel p-4 rounded-xl border border-border-subtle hover:border-cyan/40 transition cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        {acc.avatar ? (
                          <img
                            src={acc.avatar}
                            alt={acc.name}
                            className="w-10 h-10 rounded-full object-cover border border-border-subtle group-hover:border-cyan/50"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-cyan/20 text-cyan font-bold flex items-center justify-center text-sm">
                            {acc.name.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-heading font-bold text-sm text-text-primary group-hover:text-cyan transition">
                              {acc.name}
                            </span>
                            <span
                              className={`text-[9px] font-mono px-2 py-0.5 rounded border ${badge.bg} ${badge.text} ${badge.border}`}
                            >
                              {acc.role}
                            </span>
                          </div>
                          <div className="text-[11px] font-mono text-text-muted">
                            {acc.email}
                          </div>
                          {acc.subLabel && (
                            <div className="text-[10px] text-text-secondary">
                              {acc.subLabel}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-lg bg-navy-850 border border-border-subtle flex items-center justify-center text-text-secondary group-hover:text-cyan group-hover:border-cyan/40 transition shrink-0 ml-3">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-xl border border-border-subtle text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan/10 border border-cyan/30 text-cyan flex items-center justify-center mx-auto">
                  <UserPlus className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-sm text-text-primary">
                  No Accounts Created Yet
                </h3>
                <p className="text-xs text-text-secondary max-w-sm mx-auto">
                  Database has been cleaned. Sign in with Google / Gmail to create your first operational role.
                </p>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(true)}
                  className="px-5 py-2.5 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow inline-flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Sign in with Google / Gmail</span>
                </button>
              </div>
            )}
          </div>

          {/* Google & Direct Credentials Form (5 Cols) */}
          <div className="lg:col-span-5 glass-panel-glow p-6 rounded-2xl border border-cyan/30 shadow-2xl space-y-5">
            <div className="pb-3 border-b border-border-subtle">
              <h3 className="font-heading text-base font-bold text-text-primary">
                Direct Sign In
              </h3>
              <p className="text-xs text-text-secondary">
                Sign in with your Google / Gmail account or credentials.
              </p>
            </div>

            {/* Google / Gmail Sign In Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-medium text-xs shadow-md transition flex items-center justify-center gap-3 border border-slate-200"
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
                Or With Credentials
              </span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/30 text-status-error text-xs">
                {error}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleLogin();
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="text-text-secondary block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@gmail.com or name@company.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-navy-900 border border-border-subtle text-text-primary focus:border-cyan focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-text-secondary block mb-1">Password</label>
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
                disabled={loading}
                className="w-full py-3 rounded-xl bg-cyan text-navy-950 font-heading font-bold text-xs hover:bg-cyan/90 transition shadow-glow flex items-center justify-center gap-2"
              >
                <span>{loading ? "Verifying Session..." : "Sign In to Control Center"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-text-secondary">
              Don't have an account?{" "}
              <Link href="/register" className="text-cyan font-semibold hover:underline">
                Register New Role
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Google Account Chooser Modal */}
      <GoogleAccountChooserModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        onSelectAccount={handleGoogleAccountSelected}
      />

      <Footer />
    </div>
  );
}
