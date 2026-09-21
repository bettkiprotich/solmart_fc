import { getSessionUser } from "@/lib/auth/session";
import { hasMinimumRole } from "@/lib/auth/permissions";
import type { UserRole } from "@prisma/client";

export async function requireRole(role: UserRole) {
  const user = await getSessionUser();
  if (!user || !hasMinimumRole(user.role, role)) return null;
  return user;
}
