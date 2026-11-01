import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, signSessionToken, UserRole } from "@/lib/auth";

const ALLOWED_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "DISPATCHER",
  "FLEET_MANAGER",
  "DRIVER",
  "CUSTOMER",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      password,
      role = "CUSTOMER",
      phone,
      company,
      avatar,
      authProvider = "CREDENTIALS",
      metadata,
    } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: "Name and email address are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const targetRole = ALLOWED_ROLES.includes(role as UserRole)
      ? (role as UserRole)
      : "CUSTOMER";

    // Hash password or generate secure random hash for Google OAuth users
    const pwdToHash = password && password.trim().length > 0
      ? password
      : `google_oauth_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const passwordHash = await hashPassword(pwdToHash);

    // Format metadata as JSON string if passed as object
    const metadataString =
      typeof metadata === "object" ? JSON.stringify(metadata) : metadata || null;

    // Default company from metadata or role
    let computedCompany = company;
    if (!computedCompany && metadata) {
      const parsed = typeof metadata === "object" ? metadata : JSON.parse(metadataString || "{}");
      computedCompany =
        parsed.organizationName ||
        parsed.companyName ||
        parsed.commandCenter ||
        parsed.hub ||
        parsed.depot ||
        "NEXTRAK Indian Logistics Network";
    }

    // Upsert or create user
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { email: normalizedEmail },
        data: {
          name: name || existing.name,
          role: targetRole,
          phone: phone || existing.phone,
          company: computedCompany || existing.company,
          avatar: avatar || existing.avatar,
          authProvider: authProvider || existing.authProvider,
          metadata: metadataString || existing.metadata,
        },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name,
          email: normalizedEmail,
          passwordHash,
          role: targetRole,
          phone: phone || null,
          company: computedCompany || "NEXTRAK Operations",
          avatar:
            avatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=00d4ff,0284c7`,
          authProvider,
          metadata: metadataString,
        },
      });
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
      message: `Account registered successfully as ${targetRole}`,
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
  } catch (error: any) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to register account" },
      { status: 500 }
    );
  }
}

