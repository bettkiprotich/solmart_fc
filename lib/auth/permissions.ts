import type { AppRole } from "./config";

const hierarchy: Record<AppRole, number> = {
  CUSTOMER: 10,
  ADMIN: 20,
  SUPER_ADMIN: 30,
};

export function hasMinimumRole(role: AppRole, required: AppRole) {
  return hierarchy[role] >= hierarchy[required];
}
