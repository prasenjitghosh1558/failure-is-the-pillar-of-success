import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET_KEY = new TextEncoder().encode(
  process.env.AUTH_SECRET || "nextrak_super_secret_jwt_key_2026_production_grade"
);

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "DISPATCHER"
  | "FLEET_MANAGER"
  | "DRIVER"
  | "CUSTOMER";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string | null;
  avatar?: string | null;
  phone?: string | null;
  authProvider?: string | null;
  metadata?: string | null;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function signSessionToken(payload: SessionUser): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = cookies();
    const token = cookieStore.get("nextrak_session")?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "shipments:read",
    "shipments:create",
    "shipments:edit",
    "shipments:delete",
    "fleet:read",
    "fleet:manage",
    "routes:optimize",
    "analytics:read",
    "analytics:export",
    "users:manage",
    "settings:manage",
  ],
  ADMIN: [
    "shipments:read",
    "shipments:create",
    "shipments:edit",
    "shipments:delete",
    "fleet:read",
    "fleet:manage",
    "routes:optimize",
    "analytics:read",
    "analytics:export",
    "users:manage",
  ],
  DISPATCHER: [
    "shipments:read",
    "shipments:create",
    "shipments:edit",
    "shipments:delete",
    "fleet:read",
    "routes:optimize",
    "analytics:read",
  ],
  FLEET_MANAGER: [
    "fleet:read",
    "fleet:manage",
    "routes:optimize",
    "shipments:read",
    "shipments:create",
    "shipments:edit",
    "shipments:delete",
    "analytics:read",
  ],
  DRIVER: [
    "shipments:read",
    "shipments:create",
    "shipments:edit",
    "fleet:read",
    "routes:read",
  ],
  CUSTOMER: [
    "shipments:read",
    "shipments:read_own",
    "shipments:create",
    "shipments:edit",
    "shipments:delete",
    "notifications:read",
  ],
};

export function hasPermission(role: UserRole, permission: string): boolean {
  const allowed = ROLE_PERMISSIONS[role] || [];
  return allowed.includes(permission);
}
