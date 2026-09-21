import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { jsonError } from "@/lib/http/response";

export async function GET() {
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);

  const [users, products, players, upcomingMatches, orders, pendingContacts, revenue] = await prisma.$transaction([
    prisma.user.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.player.count({ where: { isActive: true } }),
    prisma.fixture.count({ where: { kickoffAt: { gte: new Date() }, status: "SCHEDULED" } }),
    prisma.order.count(),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: ["PAID", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "DELIVERED"] } } }),
  ]);

  return NextResponse.json({ metrics: { users, activeProducts: products, activePlayers: players, upcomingMatches, orders, pendingContacts, revenue: revenue._sum.total?.toString() ?? "0" } });
}
