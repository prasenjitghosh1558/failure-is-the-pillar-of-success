import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { MapboxService } from "@/lib/integrations/mapbox";

export async function GET() {
  try {
    const routes = await prisma.route.findMany({
      include: {
        vehicle: true,
        driver: true,
        stops: {
          orderBy: { stopOrder: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ routes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "routes:optimize")) {
      return NextResponse.json(
        { error: "Unauthorized. Insufficient permissions to plan/optimize routes." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      vehicleId,
      driverId,
      startLocation,
      destination,
      stops = [], // array of { address: string }
      optimizationType = "MULTI_STOP_TSP",
    } = body;

    if (!startLocation || !destination) {
      return NextResponse.json(
        { error: "Start location and destination are required." },
        { status: 400 }
      );
    }

    // Geocode start & destination
    const startCoord = (await MapboxService.geocodeAddress(startLocation)) || {
      lat: 41.8781,
      lng: -87.6298,
    };
    const destCoord = (await MapboxService.geocodeAddress(destination)) || {
      lat: 42.3314,
      lng: -83.0458,
    };

    // Geocode intermediate stops
    const geocodedStops: { address: string; lat: number; lng: number }[] = [];
    for (const stop of stops) {
      if (stop.address && stop.address.trim()) {
        const coord = (await MapboxService.geocodeAddress(stop.address)) || {
          lat: startCoord.lat + (Math.random() - 0.5) * 0.5,
          lng: startCoord.lng + (Math.random() - 0.5) * 0.5,
        };
        geocodedStops.push({
          address: stop.address,
          lat: coord.lat,
          lng: coord.lng,
        });
      }
    }

    // Run Optimization
    const optimization = await MapboxService.optimizeRoute(
      startCoord,
      destCoord,
      geocodedStops.map((s) => ({ lat: s.lat, lng: s.lng }))
    );

    const routeNumber = `RT-${Date.now().toString().slice(-6)}`;

    // Create Route in Database
    const route = await prisma.route.create({
      data: {
        routeNumber,
        vehicleId: vehicleId || null,
        driverId: driverId || null,
        startLocation,
        destination,
        startLat: startCoord.lat,
        startLng: startCoord.lng,
        destLat: destCoord.lat,
        destLng: destCoord.lng,
        totalDistanceKm: optimization.distanceKm,
        estimatedDuration: optimization.durationFormatted,
        status: "PLANNED",
        optimizationType,
        stops: {
          create: geocodedStops.map((stop, index) => {
            const calculatedOrder = optimization.stopsOrder[index] || index + 1;
            return {
              address: stop.address,
              latitude: stop.lat,
              longitude: stop.lng,
              stopOrder: calculatedOrder,
              deliveryStatus: "PENDING",
            };
          }),
        },
      },
      include: {
        vehicle: true,
        driver: true,
        stops: {
          orderBy: { stopOrder: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      route,
      optimizationResult: {
        source: optimization.source,
        savingsPercent: optimization.savingsPercent,
        coordinates: optimization.coordinates,
      },
    });
  } catch (error) {
    console.error("Route optimization API error:", error);
    return NextResponse.json(
      { error: "Failed to optimize route" },
      { status: 500 }
    );
  }
}

