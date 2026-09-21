import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { saveImageUpload, saveVideoUpload } from "@/lib/services/uploads";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { getClientKey } from "@/lib/http/request";
export const runtime = "nodejs";
export async function POST(request: Request) {
  const e = assertSameOrigin(request); if (e) return e;
  const a = await requireRole("ADMIN"); if (!a) return jsonError("Administrator access required.", 403);
  const limit = checkRateLimit(`upload:${a.id}:${getClientKey(request)}`, 20);
  if (!limit.allowed) return jsonError("Too many uploads. Please wait and try again.", 429);
  try {
    const form = await request.formData(); const file = form.get("file"); const folder = String(form.get("folder") || "");
    if (!(file instanceof File)) return jsonError("File is required.", 422);
    if (["players", "products", "galleries", "teams"].includes(folder)) return NextResponse.json({ url: await saveImageUpload(file, folder as "players" | "products" | "galleries" | "teams") }, { status: 201 });
    if (folder === "videos") return NextResponse.json({ url: await saveVideoUpload(file) }, { status: 201 });
    return jsonError("Invalid upload folder.", 422);
  } catch (err) { return jsonError(err instanceof Error ? err.message : "Unable to upload file.", 422); }
}
