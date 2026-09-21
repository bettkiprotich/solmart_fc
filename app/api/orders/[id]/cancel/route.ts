import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth/session";
import { assertSameOrigin } from "@/lib/http/request";
import { prisma } from "@/lib/db/prisma";
import { jsonError } from "@/lib/http/response";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in to cancel an order.", 401);
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { payments: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) return jsonError("Order not found.", 404);
  if (order.status !== "PENDING_PAYMENT") return jsonError("Only unpaid orders can be cancelled.", 409);
  const latestPayment = order.payments[0];
  if (latestPayment?.status === "PROCESSING") {
    return jsonError("This payment is still processing and cannot be cancelled yet.", 409);
  }
  await prisma.$transaction(async tx => {
    if (latestPayment && ["PENDING", "FAILED"].includes(latestPayment.status)) {
      await tx.payment.update({ where: { id: latestPayment.id }, data: { status: "CANCELLED", failureReason: "Cancelled by customer.", processedAt: new Date() } });
    }
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
  });
  return NextResponse.json({ success: true, orderId: order.id, status: "CANCELLED" });
}
