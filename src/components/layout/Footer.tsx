import React from "react";
import Link from "next/link";
import { Compass, ShieldCheck, Cpu, Globe2, Radio, CheckCircle2 } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border-subtle bg-navy-950 text-text-secondary pt-16 pb-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-border-subtle">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy-900 border border-cyan/40 flex items-center justify-center text-cyan shadow-glow">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-lg text-text-primary">
                NEX<span className="text-cyan">TRAK</span> PharmaOS
              </span>
            </div>
            <p className="text-xs leading-relaxed text-text-secondary">
              National Medical, Vaccine, and Critical Life-Sciences Supply Chain Operating System.
              Continuous cryogenic (-80°C to +25°C) telemetry, CDSCO Form 20B/21B compliance,
              WDFC refrigerated rakes, and emergency air plasma lifelines.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-text-muted">
              <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
              <span>CDSCO & WHO-GDP Telemetry Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-wider text-text-primary">
              Control Center
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/track" className="hover:text-cyan transition">
                  Public Consignment Tracker
                </Link>
              </li>
              <li>
                <Link href="/dashboard/live-tracking" className="hover:text-cyan transition">
                  National Medical Matrix
                </Link>
              </li>
              <li>
                <Link href="/dashboard/shipments" className="hover:text-cyan transition">
                  Vaccine & Biologics Manifests
                </Link>
              </li>
              <li>
                <Link href="/dashboard/fleet" className="hover:text-cyan transition">
                  Cold Reefer & Rake Fleets
                </Link>
              </li>
              <li>
                <Link href="/dashboard/routes" className="hover:text-cyan transition">
                  Hospital Route Optimizer (TSP)
                </Link>
              </li>
            </ul>
          </div>

          {/* Integration Specs */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-wider text-text-primary">
              Healthcare & Regulatory Adapters
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                <span>CDSCO Form 20B / 21B Compliance Sync</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                <span>WHO Good Distribution Practices (GDP)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                <span>BLE Cryogenic (-80°C to +25°C) Loggers</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                <span>WDFC Electric Twin-Genset Reefer Rakes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan" />
                <span>Airport Coolport Apron Expedited Link</span>
              </li>
            </ul>
          </div>

          {/* Compliance & Demo Disclaimer */}
          <div className="space-y-3">
            <h4 className="font-heading text-xs uppercase tracking-wider text-text-primary">
              Data Integrity
            </h4>
            <div className="p-3 rounded-lg bg-navy-900 border border-border-subtle text-[11px] leading-relaxed text-text-secondary">
              <p className="font-semibold text-text-primary mb-1">
                Zero Temperature Excursion Policy
              </p>
              Automated continuous temperature logging with instant excursion tripwire warnings.
              All pharmaceutical batches are strictly validated against tamper-evident chain-of-custody protocols.
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-4">
          <p>© 2026 NEXTRAK PharmaOS • National Life-Sciences Supply Chain. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-text-primary cursor-pointer">Privacy Policy</span>
            <span className="hover:text-text-primary cursor-pointer">Terms of Service</span>
            <span className="hover:text-text-primary cursor-pointer">Security Whitepaper</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

