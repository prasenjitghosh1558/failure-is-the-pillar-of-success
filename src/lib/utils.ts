import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatDateOnly(date: Date | string | null | undefined): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function generateTrackingNumber(prefix = "NX"): string {
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const suffix = ["US", "EXP", "INT", "FRT"][Math.floor(Math.random() * 4)];
  return `${prefix}-${randomNum}-${suffix}`;
}

export function getStatusBadgeInfo(status: string) {
  switch (status.toUpperCase()) {
    case "DELIVERED":
      return {
        label: "Delivered",
        color: "text-status-success bg-status-success/15 border-status-success/30",
        dot: "bg-status-success",
      };
    case "OUT_FOR_DELIVERY":
      return {
        label: "Out for Delivery",
        color: "text-cyan bg-cyan/15 border-cyan/30",
        dot: "bg-cyan animate-pulse",
      };
    case "IN_TRANSIT":
      return {
        label: "In Transit",
        color: "text-cyan bg-cyan/15 border-cyan/30",
        dot: "bg-cyan",
      };
    case "ORIGIN_FACILITY":
    case "ARRIVED_AT_FACILITY":
    case "DESTINATION_FACILITY":
      return {
        label: "Facility Transit",
        color: "text-purple-accent bg-purple-accent/15 border-purple-accent/30",
        dot: "bg-purple-accent",
      };
    case "PICKED_UP":
      return {
        label: "Picked Up",
        color: "text-purple-accent bg-purple-accent/15 border-purple-accent/30",
        dot: "bg-purple-accent",
      };
    case "CONFIRMED":
    case "CREATED":
      return {
        label: "Confirmed",
        color: "text-blue-400 bg-blue-500/15 border-blue-400/30",
        dot: "bg-blue-400",
      };
    case "DELAYED":
      return {
        label: "Delayed",
        color: "text-status-warning bg-status-warning/15 border-status-warning/30",
        dot: "bg-status-warning",
      };
    case "EXCEPTION":
    case "FAILED":
      return {
        label: "Exception",
        color: "text-status-error bg-status-error/15 border-status-error/30",
        dot: "bg-status-error",
      };
    case "CANCELLED":
    case "RETURNED":
      return {
        label: "Cancelled",
        color: "text-gray-400 bg-gray-500/15 border-gray-400/30",
        dot: "bg-gray-400",
      };
    default:
      return {
        label: status,
        color: "text-text-secondary bg-navy-800 border-border-subtle",
        dot: "bg-text-secondary",
      };
  }
}

