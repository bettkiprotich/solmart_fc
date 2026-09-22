import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

const schema = z.object({
  status: z.enum(["PENDING_PAYMENT", "PAID", "PROCESSING", "READY_FOR_DISPATCH", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]),
});

export async function GET(request: Request) {
  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  const orders = await prisma.order.findMany({
    include: {
      items: true,
      payments: {
        select: {
          id: true,
          status: true,
          provider: true,
          amount: true,
          transactionReference: true,
          providerReceipt: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip,
  });

  const total = await prisma.order.count();

  return NextResponse.json({ orders, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}

export async function PATCH(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Order id is required.", 422);

  const p = schema.safeParse(await request.json());
  if (!p.success) return jsonError("Invalid order status.", 422);

  const order = await prisma.order.update({
    where: { id },
    data: { status: p.data.status },
  });

  return NextResponse.json({ order });
}

export async function DELETE(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("SUPER_ADMIN");
  if (!a) return jsonError("Super administrator access required.", 403);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Order id is required.", 422);

  const order = await prisma.order.findUnique({
    where: { id },
    include: { payments: { select: { status: true } } },
  });

  if (!order) return jsonError("Order not found.", 404);

  const hasSuccessfulPayment = order.payments.some((p) => p.status === "SUCCESS");
  if (hasSuccessfulPayment) {
    return jsonError("Paid orders cannot be deleted. Preserve them for financial records.", 422);
  }

  if (!["PENDING_PAYMENT", "CANCELLED"].includes(order.status)) {
    return jsonError("Only unpaid pending or cancelled orders can be deleted.", 422);
  }

  await prisma.order.delete({ where: { id } });

  return NextResponse.json({ message: `Order ${order.orderNumber} deleted.` });
}
