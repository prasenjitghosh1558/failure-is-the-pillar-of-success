import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        company: true,
        avatar: true,
        phone: true,
        authProvider: true,
        metadata: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const parsedUsers = users.map((u) => {
      let metaObj: any = {};
      try {
        if (u.metadata) {
          metaObj = JSON.parse(u.metadata);
        }
      } catch {}

      // Calculate a descriptive sub-label based on role and metadata
      let subLabel = u.company || "";
      if (u.role === "SUPER_ADMIN") {
        subLabel = metaObj.commandCenter || "National Logistics Command (New Delhi)";
      } else if (u.role === "DISPATCHER") {
        subLabel = metaObj.hub ? `${metaObj.hub} • ${metaObj.shift || "Shift A"}` : "Delhi NCR Hub";
      } else if (u.role === "FLEET_MANAGER") {
        subLabel = metaObj.depot ? `${metaObj.depot} • ${metaObj.fleetSize || "50+ HCVs"}` : "Bhiwandi MMLP Depot";
      } else if (u.role === "DRIVER") {
        subLabel = metaObj.assignedPlate ? `Plate: ${metaObj.assignedPlate}` : "HGV Multi-Axle Fleet";
      } else if (u.role === "CUSTOMER") {
        subLabel = metaObj.organizationName || metaObj.deliveryCity || u.company || "Tata Precision Auto Tech";
      }

      return {
        ...u,
        parsedMetadata: metaObj,
        subLabel,
      };
    });

    return NextResponse.json({
      success: true,
      accounts: parsedUsers,
    });
  } catch (error) {
    console.error("Fetch accounts error:", error);
    return NextResponse.json(
      { error: "Failed to fetch registered accounts" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Account ID is required to delete" },
        { status: 400 }
      );
    }

    // Cascade cleanup
    await prisma.notification.deleteMany({ where: { userId: id } });
    await prisma.auditLog.deleteMany({ where: { userId: id } });
    await prisma.user.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
