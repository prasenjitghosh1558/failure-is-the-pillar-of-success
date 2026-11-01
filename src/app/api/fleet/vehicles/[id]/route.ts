import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "fleet:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { status, driverId, fuelLevelPercent, batteryPercent, lastLatitude, lastLongitude } = body;

    const data: any = {};
    if (status) data.status = status;
    if (driverId !== undefined) data.driverId = driverId || null;
    if (fuelLevelPercent !== undefined) data.fuelLevelPercent = parseFloat(fuelLevelPercent);
    if (batteryPercent !== undefined) data.batteryPercent = parseFloat(batteryPercent);
    if (lastLatitude !== undefined && lastLongitude !== undefined) {
      data.lastLatitude = parseFloat(lastLatitude);
      data.lastLongitude = parseFloat(lastLongitude);
      data.lastLocationUpdate = new Date();
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: params.id },
      data,
      include: {
        driver: true,
      },
    });

    return NextResponse.json({ success: true, vehicle });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vehicle" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "fleet:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.vehicle.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Vehicle removed" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete vehicle" }, { status: 500 });
  }
}

