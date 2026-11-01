import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";
import { generateTrackingNumber } from "@/lib/utils";
import { MapboxService } from "@/lib/integrations/mapbox";
import { EmailService } from "@/lib/integrations/email-service";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const carrier = searchParams.get("carrier") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const where: any = {};

    if (status && status !== "ALL") {
      where.currentStatus = status;
    }

    if (carrier && carrier !== "ALL") {
      where.carrier = carrier;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search } },
        { recipientName: { contains: search } },
        { senderName: { contains: search } },
        { destinationCity: { contains: search } },
        { originCity: { contains: search } },
      ];
    }

    const [total, shipments] = await Promise.all([
      prisma.shipment.count({ where }),
      prisma.shipment.findMany({
        where,
        include: {
          assignedVehicle: {
            include: {
              driver: true,
            },
          },
          events: {
            orderBy: { eventTimestamp: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      shipments,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("List shipments API error:", error);
    return NextResponse.json({ error: "Failed to fetch shipments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();

    const body = await req.json();
    const {
      trackingNumber: customTrackingNumber,
      senderName,
      senderAddress,
      senderCity,
      recipientName,
      recipientAddress,
      recipientCity,
      carrier = "NEXTRAK Pharma Road Reefer",
      serviceType = "Cryogenic Reefer Express (-20°C)",
      weightKg = 5.0,
      dimensions = "30x20x15 cm",
      packageType = "Cryo Box",
      packageDescription = "Cryogenic mRNA Vaccines (-20°C)",
      specialInstructions,
      assignedVehicleId,
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      currentStatus = "CREATED",
      initialMilestoneTitle,
      initialMilestoneLocation,
    } = body;

    if (!senderName || !senderCity || !recipientName || !recipientCity) {
      return NextResponse.json(
        { error: "Sender and Recipient names and cities are required." },
        { status: 400 }
      );
    }

    // Default to provided coordinates or fallback to geocode / India hub centroids
    const oLat = typeof originLat === "number" ? originLat : 17.385;
    const oLng = typeof originLng === "number" ? originLng : 78.4867;
    const dLat = typeof destinationLat === "number" ? destinationLat : 28.6139;
    const dLng = typeof destinationLng === "number" ? destinationLng : 77.209;

    const trackingNumber =
      customTrackingNumber && customTrackingNumber.trim().length > 0
        ? customTrackingNumber.trim().toUpperCase()
        : generateTrackingNumber("NX");

    const estimatedDelivery = new Date(Date.now() + 86400000 * 2); // 2 days default

    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        carrier,
        serviceType,
        currentStatus,
        sourceType: "TELEMATICS_GPS",
        senderId: user?.id || null,
        senderName,
        senderAddress: senderAddress || `${senderCity} Regional Logistics Hub`,
        senderCity,
        recipientName,
        recipientAddress: recipientAddress || `${recipientCity} Medical Delivery Depot`,
        recipientCity,
        originCity: senderCity,
        originLat: oLat,
        originLng: oLng,
        destinationCity: recipientCity,
        destinationLat: dLat,
        destinationLng: dLng,
        currentLat: oLat,
        currentLng: oLng,
        weightKg: parseFloat(weightKg) || 5.0,
        dimensions,
        packageType,
        packageDescription,
        specialInstructions,
        estimatedDelivery,
        assignedVehicleId: assignedVehicleId || null,
        events: {
          create: {
            status: currentStatus,
            title: initialMilestoneTitle || "Consignment Manifest Registered & Sealed",
            description: `Manifest ${trackingNumber} created via NEXTRAK Logistics Portal.`,
            location: initialMilestoneLocation || senderCity,
            latitude: oLat,
            longitude: oLng,
            source: "MANUAL_DISPATCH",
          },
        },
      },
      include: {
        events: true,
      },
    });

    // Create Audit Log if user session exists
    if (user?.id) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action: "CREATE_SHIPMENT",
          resourceType: "Shipment",
          resourceId: shipment.id,
          details: `Created shipment ${trackingNumber} from ${senderCity} to ${recipientCity}`,
        },
      });

      await prisma.notification.create({
        data: {
          userId: user.id,
          title: `Shipment Registered: ${trackingNumber}`,
          message: `Package booked for ${recipientName} (${recipientCity}).`,
          type: "PICKUP",
          linkUrl: `/track/${trackingNumber}`,
        },
      });
    }

    return NextResponse.json({ success: true, shipment }, { status: 201 });
  } catch (error) {
    console.error("Create shipment API error:", error);
    return NextResponse.json({ error: "Failed to create shipment" }, { status: 500 });
  }
}

