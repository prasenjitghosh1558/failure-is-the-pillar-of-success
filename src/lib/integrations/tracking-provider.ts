/**
 * NEXTRAK Unified Tracking Provider Abstraction Layer
 * Supports AfterShip API, EasyPost API, and Demo Tracking Engine.
 *
 * Accurately marks data sources (CARRIER_SCAN vs TELEMATICS_GPS vs SYSTEM_DEMO)
 * without ever faking provider connectivity.
 */

export type NormalizedTrackingStatus =
  | "CREATED"
  | "CONFIRMED"
  | "PICKED_UP"
  | "ORIGIN_FACILITY"
  | "IN_TRANSIT"
  | "DESTINATION_FACILITY"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELAYED"
  | "EXCEPTION"
  | "FAILED"
  | "RETURNED"
  | "CANCELLED";

export interface NormalizedTrackingEvent {
  status: NormalizedTrackingStatus;
  title: string;
  description: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  source: "CARRIER_SCAN" | "TELEMATICS_GPS" | "SYSTEM_DEMO" | "MANUAL_DISPATCH";
  eventTimestamp: string;
}

export interface NormalizedTrackingResult {
  trackingNumber: string;
  carrier: string;
  status: NormalizedTrackingStatus;
  origin: string;
  destination: string;
  estimatedDelivery: string;
  events: NormalizedTrackingEvent[];
  source: "AFTERSHIP_API" | "EASYPOST_API" | "SYSTEM_DEMO";
  isRealProvider: boolean;
  providerNotice?: string;
}

export interface ITrackingProvider {
  name: string;
  isConfigured(): boolean;
  fetchTracking(trackingNumber: string, carrier?: string): Promise<NormalizedTrackingResult | null>;
  registerTracking(trackingNumber: string, carrier: string): Promise<boolean>;
}

export class AfterShipProvider implements ITrackingProvider {
  name = "AfterShip";
  private apiKey = process.env.AFTERSHIP_API_KEY || "";

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async fetchTracking(trackingNumber: string, carrier?: string): Promise<NormalizedTrackingResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const slug = carrier ? carrier.toLowerCase().replace(/\s+/g, "-") : "";
      const url = slug
        ? `https://api.aftership.com/v4/trackings/${slug}/${trackingNumber}`
        : `https://api.aftership.com/v4/trackings/last_known/${trackingNumber}`;

      const res = await fetch(url, {
        headers: {
          "aftership-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      const tracking = data?.data?.tracking;
      if (!tracking) return null;

      const events: NormalizedTrackingEvent[] = (tracking.checkpoints || []).map((cp: any) => ({
        status: mapCarrierStatus(cp.tag || tracking.tag),
        title: cp.message || "Carrier Checkpoint",
        description: cp.subtag_message || cp.message || "",
        location: [cp.city, cp.state, cp.country_name].filter(Boolean).join(", "),
        source: "CARRIER_SCAN",
        eventTimestamp: cp.checkpoint_time,
      }));

      return {
        trackingNumber: tracking.tracking_number,
        carrier: tracking.slug?.toUpperCase() || "CARRIER",
        status: mapCarrierStatus(tracking.tag),
        origin: [tracking.origin_city, tracking.origin_country_name].filter(Boolean).join(", "),
        destination: [tracking.destination_city, tracking.destination_country_name].filter(Boolean).join(", "),
        estimatedDelivery: tracking.expected_delivery || new Date().toISOString(),
        events,
        source: "AFTERSHIP_API",
        isRealProvider: true,
        providerNotice: "Verified live carrier feed via AfterShip API.",
      };
    } catch (e) {
      console.error("AfterShip fetch error:", e);
      return null;
    }
  }

  async registerTracking(trackingNumber: string, carrier: string): Promise<boolean> {
    if (!this.isConfigured()) return false;
    try {
      const res = await fetch("https://api.aftership.com/v4/trackings", {
        method: "POST",
        headers: {
          "aftership-api-key": this.apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tracking: {
            tracking_number: trackingNumber,
            slug: carrier.toLowerCase().replace(/\s+/g, "-"),
          },
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export class EasyPostProvider implements ITrackingProvider {
  name = "EasyPost";
  private apiKey = process.env.EASYPOST_API_KEY || "";

  isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.length > 5);
  }

  async fetchTracking(trackingNumber: string, carrier?: string): Promise<NormalizedTrackingResult | null> {
    if (!this.isConfigured()) return null;

    try {
      const url = `https://api.easypost.com/v2/trackers?tracking_code=${trackingNumber}${
        carrier ? `&carrier=${carrier}` : ""
      }`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      if (!res.ok) return null;
      const data = await res.json();
      const tracker = data?.trackers?.[0];
      if (!tracker) return null;

      const events: NormalizedTrackingEvent[] = (tracker.tracking_details || []).map((detail: any) => ({
        status: mapCarrierStatus(detail.status),
        title: detail.message || "Carrier Scan",
        description: detail.description || "",
        location: [detail.tracking_location?.city, detail.tracking_location?.state].filter(Boolean).join(", "),
        source: "CARRIER_SCAN",
        eventTimestamp: detail.datetime,
      }));

      return {
        trackingNumber: tracker.tracking_code,
        carrier: tracker.carrier,
        status: mapCarrierStatus(tracker.status),
        origin: tracker.carrier_detail?.origin_location || "Origin Facility",
        destination: tracker.carrier_detail?.destination_location || "Destination Address",
        estimatedDelivery: tracker.est_delivery_date || new Date().toISOString(),
        events,
        source: "EASYPOST_API",
        isRealProvider: true,
        providerNotice: "Verified live tracking via EasyPost API.",
      };
    } catch {
      return null;
    }
  }

  async registerTracking(): Promise<boolean> {
    return false;
  }
}

export class DemoTrackingProvider implements ITrackingProvider {
  name = "Demo Engine";

  isConfigured(): boolean {
    return true;
  }

  async fetchTracking(trackingNumber: string): Promise<NormalizedTrackingResult | null> {
    // Returns null if tracking number isn't in seeded database;
    // Database records serve as the single source of truth!
    return null;
  }

  async registerTracking(): Promise<boolean> {
    return true;
  }
}

function mapCarrierStatus(status: string): NormalizedTrackingStatus {
  if (!status) return "IN_TRANSIT";
  const s = status.toUpperCase();
  if (s.includes("DELIVERED")) return "DELIVERED";
  if (s.includes("OUT_FOR_DELIVERY") || s.includes("OUT FOR DELIVERY")) return "OUT_FOR_DELIVERY";
  if (s.includes("TRANSIT") || s.includes("INTRANSIT")) return "IN_TRANSIT";
  if (s.includes("PICK") || s.includes("INFO_RECEIVED")) return "PICKED_UP";
  if (s.includes("DELAY") || s.includes("WEATHER")) return "DELAYED";
  if (s.includes("FAIL")) return "FAILED";
  if (s.includes("CANCEL")) return "CANCELLED";
  if (s.includes("EXCEPTION")) return "EXCEPTION";
  return "IN_TRANSIT";
}

export function getTrackingProvider(): ITrackingProvider {
  const aftership = new AfterShipProvider();
  if (aftership.isConfigured()) return aftership;

  const easypost = new EasyPostProvider();
  if (easypost.isConfigured()) return easypost;

  return new DemoTrackingProvider();
}

