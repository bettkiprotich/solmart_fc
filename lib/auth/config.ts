export const SESSION_COOKIE_NAME = "solmart_fc_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export const authConfig = {
  sessionCookieName: SESSION_COOKIE_NAME,
  sessionMaxAgeSeconds: SESSION_MAX_AGE_SECONDS,
  roles: ["CUSTOMER", "ADMIN", "SUPER_ADMIN"] as const,
};

export type AppRole = (typeof authConfig.roles)[number];
