import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const {
      status,
      title,
      description,
      location,
      latitude,
      longitude,
      progress,
      temperature,
    } = body;

    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.currentStatus = status;

    if (typeof progress === "number") {
      const frac = Math.max(0, Math.min(100, progress)) / 100;
      updateData.currentLat = shipment.originLat + (shipment.destinationLat - shipment.originLat) * frac;
      updateData.currentLng = shipment.originLng + (shipment.destinationLng - shipment.originLng) * frac;
    } else if (typeof latitude === "number" && typeof longitude === "number") {
      updateData.currentLat = latitude;
      updateData.currentLng = longitude;
    }

    if (status === "DELIVERED") {
      updateData.actualDelivery = new Date();
      updateData.currentLat = shipment.destinationLat;
      updateData.currentLng = shipment.destinationLng;
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: params.id },
      data: updateData,
    });

    const event = await prisma.trackingEvent.create({
      data: {
        shipmentId: shipment.id,
        status: status || shipment.currentStatus,
        title: title || `Status: ${status || shipment.currentStatus}`,
        description:
          description ||
          (temperature
            ? `Cold-chain sensor reading: ${temperature}. Progress: ${progress || 50}%.`
            : "Checkpoint verified."),
        location: location || shipment.destinationCity,
        latitude: updateData.currentLat || shipment.currentLat,
        longitude: updateData.currentLng || shipment.currentLng,
        source: "TELEMATICS_GPS",
      },
    });

    return NextResponse.json({ success: true, event, shipment: updatedShipment }, { status: 201 });
  } catch (error) {
    console.error("Create checkpoint error:", error);
    return NextResponse.json({ error: "Failed to create checkpoint" }, { status: 500 });
  }
}

