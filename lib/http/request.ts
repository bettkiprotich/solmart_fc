import { jsonError } from "@/lib/http/response";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function assertSameOrigin(request: Request) {
  if (SAFE_METHODS.has(request.method)) return null;

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  
  try {
    const supplied = origin || (referer ? new URL(referer).origin : null);
    if (!supplied) return jsonError("Invalid request origin.", 403);
    
    const suppliedUrl = new URL(supplied);
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const expectedFromEnv = appUrl ? new URL(appUrl).origin : null;

    if (suppliedUrl.host !== host && supplied !== expectedFromEnv) {
      return jsonError("Invalid request origin.", 403);
    }
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
