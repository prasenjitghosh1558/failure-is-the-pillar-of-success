import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        driver: true,
        shipments: {
          where: {
            currentStatus: { in: ["IN_TRANSIT", "OUT_FOR_DELIVERY"] },
          },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      total: vehicles.length,
      active: vehicles.filter((v) => v.status === "ACTIVE" || v.status === "IN_TRANSIT").length,
      available: vehicles.filter((v) => v.status === "AVAILABLE").length,
      maintenance: vehicles.filter((v) => v.status === "MAINTENANCE").length,
    };

    return NextResponse.json({ vehicles, stats });
  } catch (error) {
    console.error("Fetch vehicles error:", error);
    return NextResponse.json({ error: "Failed to fetch vehicles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "fleet:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      registrationNumber,
      vehicleType,
      model,
      year = 2024,
      status = "AVAILABLE",
      fuelLevelPercent = 100,
      batteryPercent = 100,
      driverId,
      telematicsProvider = "DEMO_TELEMATICS",
      lastLatitude = 41.8781,
      lastLongitude = -87.6298,
    } = body;

    if (!registrationNumber || !vehicleType || !model) {
      return NextResponse.json(
        { error: "Registration number, vehicle type, and model are required." },
        { status: 400 }
      );
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        registrationNumber,
        vehicleType,
        model,
        year: parseInt(year),
        status,
        fuelLevelPercent: parseFloat(fuelLevelPercent),
        batteryPercent: parseFloat(batteryPercent),
        driverId: driverId || null,
        telematicsProvider,
        lastLatitude: parseFloat(lastLatitude),
        lastLongitude: parseFloat(lastLongitude),
      },
      include: {
        driver: true,
      },
    });

    return NextResponse.json({ success: true, vehicle }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A vehicle with this registration number already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to create vehicle" }, { status: 500 });
  }
}

