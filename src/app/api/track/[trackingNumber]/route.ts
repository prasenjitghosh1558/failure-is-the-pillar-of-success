import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getTrackingProvider } from "@/lib/integrations/tracking-provider";

export async function GET(
  req: NextRequest,
  { params }: { params: { trackingNumber: string } }
) {
  try {
    const rawNumber = decodeURIComponent(params.trackingNumber).trim();

    // 1. Check local database
    const shipment = await prisma.shipment.findFirst({
      where: {
        OR: [
          { trackingNumber: { equals: rawNumber } },
          { trackingNumber: { equals: rawNumber.toUpperCase() } },
          { externalTrackingNumber: { equals: rawNumber } },
        ],
      },
      include: {
        events: {
          orderBy: { eventTimestamp: "asc" },
        },
        assignedVehicle: {
          include: {
            driver: true,
          },
        },
      },
    });

    if (shipment) {
      return NextResponse.json({
        found: true,
        shipment,
        source: shipment.sourceType,
        isDemoData: shipment.sourceType === "SYSTEM_DEMO",
      });
    }

    // 2. Fall back to external provider if configured
    const provider = getTrackingProvider();
    if (provider.isConfigured()) {
      const externalResult = await provider.fetchTracking(rawNumber);
      if (externalResult) {
        return NextResponse.json({
          found: true,
          shipment: externalResult,
          source: externalResult.source,
          isDemoData: false,
        });
      }
    }

    return NextResponse.json(
      {
        found: false,
        message: `No active shipment found matching tracking number "${rawNumber}".`,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error("Tracking lookup API error:", error);
    return NextResponse.json(
      { error: "Failed to process tracking request" },
      { status: 500 }
    );
  }
}

