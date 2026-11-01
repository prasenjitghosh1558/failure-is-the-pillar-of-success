import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken, UserRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, id, role } = await req.json();

    let user = null;

    if (id) {
      user = await prisma.user.findUnique({ where: { id } });
    } else if (email) {
      user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    } else if (role) {
      // Find the most recently active or first user with this role
      user = await prisma.user.findFirst({
        where: { role },
        orderBy: { updatedAt: "desc" },
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: "User account not found for switching" },
        { status: 404 }
      );
    }

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as UserRole,
      company: user.company,
      avatar: user.avatar,
      phone: user.phone,
      authProvider: user.authProvider,
      metadata: user.metadata,
    };

    const token = await signSessionToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: sessionPayload,
    });

    response.cookies.set({
      name: "nextrak_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("Account switch error:", error);
    return NextResponse.json(
      { error: "Failed to switch account" },
      { status: 500 }
    );
  }
}

