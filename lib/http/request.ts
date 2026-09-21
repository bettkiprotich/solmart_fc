import { jsonError } from "@/lib/http/response";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertSameOrigin(request: Request) {
  if (SAFE_METHODS.has(request.method)) return null;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!appUrl) return jsonError("Application origin is not configured.", 500);

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  try {
    const expected = new URL(appUrl).origin;
    const supplied = origin || (referer ? new URL(referer).origin : null);
    if (!supplied || supplied !== expected) return jsonError("Invalid request origin.", 403);
  } catch {
    return jsonError("Invalid request origin.", 403);
  }
  return null;
}

export function getClientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    || request.headers.get("x-real-ip")?.trim()
    || "unknown";
}
