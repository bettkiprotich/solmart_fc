import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { contactSchema } from "@/lib/validation/api";
import { checkRateLimit } from "@/lib/security/rate-limit";
import { assertSameOrigin, getClientKey } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const limit = checkRateLimit(`contact:${getClientKey(request)}`, 5);
  if (!limit.allowed) return jsonError("Too many messages. Try again later.", 429);
  const parsed = contactSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid contact details.", 422, parsed.error.flatten());
  try {
    const message = await prisma.contactMessage.create({ data: parsed.data });
    return NextResponse.json({ success: true, id: message.id }, { status: 201 });
  } catch {
    return jsonError("Unable to submit message.", 500);
  }
}
