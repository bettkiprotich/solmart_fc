import { NextResponse } from "next/server";
import { destroyCurrentSession } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/http/request";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  await destroyCurrentSession();
  return NextResponse.json({ success: true });
}
