import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser, hasPermission } from "@/lib/auth";

export async function GET() {
  try {
    const drivers = await prisma.driver.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ drivers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !hasPermission(user.role, "fleet:manage")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, phone, licenseNumber, status = "AVAILABLE" } = body;

    if (!name || !email || !phone || !licenseNumber) {
      return NextResponse.json(
        { error: "Name, email, phone, and CDL license number are required." },
        { status: 400 }
      );
    }

    const driver = await prisma.driver.create({
      data: {
        name,
        email,
        phone,
        licenseNumber,
        status,
        rating: 5.0,
        deliveriesCompleted: 0,
      },
    });

    return NextResponse.json({ success: true, driver }, { status: 201 });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "A driver with this email already exists." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: "Failed to register driver" }, { status: 500 });
  }
}

