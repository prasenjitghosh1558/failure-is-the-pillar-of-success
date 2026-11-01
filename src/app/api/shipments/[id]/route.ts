import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { EmailService } from "@/lib/integrations/email-service";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
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

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    return NextResponse.json({ shipment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch shipment" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const body = await req.json();
    const {
      status,
      eventTitle,
      eventDescription,
      eventLocation,
      latitude,
      longitude,
      progress, // 0 to 100
      temperature,
      assignedVehicleId,
      carrier,
      serviceType,
      estimatedDelivery,
    } = body;

    const existing = await prisma.shipment.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (status) updateData.currentStatus = status;
    if (assignedVehicleId !== undefined) updateData.assignedVehicleId = assignedVehicleId || null;
    if (carrier) updateData.carrier = carrier;
    if (serviceType) updateData.serviceType = serviceType;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    // Calculate interpolated GPS from progress percentage if provided
    if (typeof progress === "number") {
      const frac = Math.max(0, Math.min(100, progress)) / 100;
      const interpLat = existing.originLat + (existing.destinationLat - existing.originLat) * frac;
      const interpLng = existing.originLng + (existing.destinationLng - existing.originLng) * frac;
      updateData.currentLat = interpLat;
      updateData.currentLng = interpLng;
    } else if (typeof latitude === "number" && typeof longitude === "number") {
      updateData.currentLat = latitude;
      updateData.currentLng = longitude;
    }

    if (status === "DELIVERED") {
      updateData.actualDelivery = new Date();
      updateData.currentLat = existing.destinationLat;
      updateData.currentLng = existing.destinationLng;
    }

    const updatedShipment = await prisma.shipment.update({
      where: { id: params.id },
      data: updateData,
    });

    // If status, eventTitle, or eventDescription provided, create TrackingEvent
    if (status || eventDescription || eventTitle || eventLocation) {
      const newStatus = status || existing.currentStatus;
      const title =
        eventTitle ||
        (status ? `Status updated to ${status}` : "Route Progress Telemetry Recorded");
      const desc =
        eventDescription ||
        (temperature
          ? `Cold-chain sensor: ${temperature}. Active progress: ${progress || 50}% along corridor.`
          : `Checkpoint logged for ${existing.trackingNumber}.`);

      await prisma.trackingEvent.create({
        data: {
          shipmentId: existing.id,
          status: newStatus,
          title,
          description: desc,
          location: eventLocation || updatedShipment.destinationCity,
          latitude: updateData.currentLat || existing.currentLat,
          longitude: updateData.currentLng || existing.currentLng,
          source: "TELEMATICS_GPS",
        },
      });

      // Audit Log if session exists
      if (user?.id) {
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: "UPDATE_STATUS",
            resourceType: "Shipment",
            resourceId: existing.id,
            details: `Updated shipment ${existing.trackingNumber} to ${newStatus} (${title})`,
          },
        });
      }
    }

    return NextResponse.json({ success: true, shipment: updatedShipment });
  } catch (error) {
    console.error("Update shipment API error:", error);
    return NextResponse.json({ error: "Failed to update shipment" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();

    const shipment = await prisma.shipment.findUnique({
      where: { id: params.id },
    });

    if (!shipment) {
      return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
    }

    // Explicitly delete all child tracking events first
    await prisma.trackingEvent.deleteMany({
      where: { shipmentId: params.id },
    });

    await prisma.shipment.delete({
      where: { id: params.id },
    });

    if (user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "DELETE_SHIPMENT",
          resourceType: "Shipment",
          resourceId: params.id,
          details: `Deleted shipment ${shipment.trackingNumber}`,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Shipment deleted successfully" });
  } catch (error) {
    console.error("Delete shipment error:", error);
    return NextResponse.json({ error: "Failed to delete shipment" }, { status: 500 });
  }
}
