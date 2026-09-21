import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getSessionUser();
  return NextResponse.json({ user }, { status: user ? 200 : 401 });
}
