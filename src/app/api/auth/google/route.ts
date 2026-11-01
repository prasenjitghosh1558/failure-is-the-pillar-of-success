import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { signSessionToken, UserRole } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, name, avatarUrl } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Gmail address is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if this Gmail already exists in Prisma DB
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (user) {
      // Existing user -> log in immediately
      const sessionPayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        company: user.company,
        avatar: user.avatar || avatarUrl,
        phone: user.phone,
        authProvider: user.authProvider,
        metadata: user.metadata,
      };

      const token = await signSessionToken(sessionPayload);

      const response = NextResponse.json({
        success: true,
        isNewUser: false,
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
    }

    // New Google/Gmail user -> return isNewUser: true so frontend can pick role in Step 2
    return NextResponse.json({
      success: true,
      isNewUser: true,
      email: normalizedEmail,
      name: name || normalizedEmail.split("@")[0].replace(/[._]/g, " "),
      avatarUrl:
        avatarUrl ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          normalizedEmail
        )}&backgroundColor=0284c7,00d4ff`,
    });
  } catch (error) {
    console.error("Google Auth error:", error);
    return NextResponse.json(
      { error: "Internal server error during Google sign-in" },
      { status: 500 }
    );
  }
}

