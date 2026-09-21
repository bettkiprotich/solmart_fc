import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/http/response";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in to view your orders.", 401);
  const orders = await prisma.order.findMany({ where: { userId: user.id }, include: { items: true, payments: { select: { id: true, provider: true, status: true, amount: true, transactionReference: true, providerReceipt: true, createdAt: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders });
}
