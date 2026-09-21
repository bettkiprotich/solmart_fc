import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

const PAYSTACK_TIMEOUT_MS = 15_000;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

type PaystackResponse = { status?: boolean; message?: string; data?: any };

function getSecretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_NOT_CONFIGURED");
  return key;
}

async function paystackFetch(path: string, init: RequestInit = {}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}${path}`, {
    ...init,
    signal: AbortSignal.timeout(PAYSTACK_TIMEOUT_MS),
    headers: {
      Authorization: `Bearer ${getSecretKey()}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({})) as PaystackResponse;
  if (!response.ok) {
    const providerMessage = typeof data?.message === "string" ? data.message : `Paystack HTTP ${response.status}`;
    const providerCode = typeof (data as any)?.code === "string" ? (data as any).code : "";
    throw new Error(`PAYSTACK_API_ERROR:${response.status}:${providerCode}:${providerMessage}`);
  }
  return data;
}

function normalizeKenyanPhone(phone: string) {
  const compact = phone.replace(/[\s()-]/g, "");
  if (/^0\d{9}$/.test(compact)) return `+254${compact.slice(1)}`;
  if (/^\+254\d{9}$/.test(compact)) return compact;
  if (/^254\d{9}$/.test(compact)) return `+${compact}`;
  throw new Error("INVALID_PAYSTACK_PHONE");
}

function reference(orderNumber: string) {
  return `SOLMART-${orderNumber}-${Date.now()}-${randomBytes(4).toString("hex")}`;
}

export async function initiatePaystackMpesa(orderId: string, userId: string, phone: string) {
  const normalizedPhone = normalizeKenyanPhone(phone);
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: { payments: { where: { status: "PROCESSING" }, orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.status !== "PENDING_PAYMENT") throw new Error("ORDER_NOT_PAYABLE");
  if (order.payments[0]) throw new Error("PAYMENT_ALREADY_PROCESSING");

  const amount = Number(order.total);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount * 100)) throw new Error("INVALID_PAYMENT_AMOUNT");

  const payment = await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: "PAYSTACK",
      status: "PENDING",
      amount,
      currency: order.currency,
      phoneNumber: normalizedPhone,
    },
  });
  const paymentReference = reference(order.orderNumber);

  try {
    const response = await paystackFetch("/charge", {
      method: "POST",
      body: JSON.stringify({
        email: order.customerEmail,
        amount: Math.round(amount * 100),
        currency: order.currency,
        reference: paymentReference,
        mobile_money: { phone: normalizedPhone, provider: "mpesa" },
        metadata: { orderId: order.id, orderNumber: order.orderNumber },
      }),
    });

    if (!response.status || !response.data?.reference) {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: response.message ?? "Paystack rejected the payment request.", providerResponse: response as object, processedAt: new Date() } });
      throw new Error("PAYSTACK_CHARGE_REJECTED");
    }

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "PROCESSING", transactionReference: response.data.reference, providerResponse: response as object },
    });
    return {
      paymentId: updated.id,
      reference: response.data.reference,
      status: response.data.status ?? "pay_offline",
      customerMessage: response.data.display_text ?? "Check your Safaricom phone and complete the M-PESA authorization.",
    };
  } catch (error) {
    if (error instanceof Error && ["PAYSTACK_CHARGE_REJECTED", "PAYSTACK_NOT_CONFIGURED", "INVALID_PAYSTACK_PHONE", "INVALID_PAYMENT_AMOUNT"].includes(error.message)) throw error;
    const message = error instanceof Error ? error.message : "";
    const diagnostic = message.startsWith("PAYSTACK_API_ERROR:") ? message : "PAYSTACK_PROVIDER_UNAVAILABLE";
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: diagnostic.slice(0, 500), providerResponse: { error: diagnostic }, processedAt: new Date() } }).catch(() => undefined);
    throw new Error(diagnostic);
  }
}

async function verifyReference(referenceValue: string) {
  return paystackFetch(`/transaction/verify/${encodeURIComponent(referenceValue)}`, { method: "GET" });
}

async function reconcileSuccess(referenceValue: string, payload: unknown) {
  const data = (payload as any)?.data ?? payload;
  const payment = await prisma.payment.findFirst({ where: { transactionReference: referenceValue, provider: "PAYSTACK" }, include: { order: true } });
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (payment.status === "SUCCESS") return { status: "SUCCESS" as const, duplicate: true };

  const paidAmount = Number(data?.amount);
  const expectedAmount = Number(payment.amount) * 100;
  if (!Number.isFinite(paidAmount) || paidAmount !== expectedAmount) throw new Error("PAYSTACK_AMOUNT_MISMATCH");
  if (data?.currency && data.currency !== payment.currency) throw new Error("PAYSTACK_CURRENCY_MISMATCH");
  if (data?.status !== "success") return { status: "PENDING" as const, duplicate: false };

  await prisma.$transaction(async tx => {
    const current = await tx.payment.findUnique({ where: { id: payment.id } });
    if (!current || current.status === "SUCCESS") return;
    await tx.payment.update({
      where: { id: current.id },
      data: {
        status: "SUCCESS",
        providerReceipt: data?.receipt_number ?? null,
        providerResponse: payload as object,
        processedAt: new Date(),
        failureReason: null,
      },
    });
    await tx.order.updateMany({ where: { id: current.orderId, status: "PENDING_PAYMENT" }, data: { status: "PAID" } });
  });
  return { status: "SUCCESS" as const, duplicate: false };
}

export async function verifyPaystackPayment(referenceValue: string) {
  const response = await verifyReference(referenceValue);
  if (!response.status || !response.data) throw new Error("PAYSTACK_VERIFY_FAILED");
  if (response.data.status === "success") return reconcileSuccess(referenceValue, response);
  if (["failed", "abandoned", "reversed"].includes(response.data.status)) {
    const payment = await prisma.payment.findFirst({ where: { transactionReference: referenceValue, provider: "PAYSTACK" } });
    if (payment) await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: response.data.gateway_response ?? response.data.message ?? "Paystack payment was not completed.", providerResponse: response as object, processedAt: new Date() } });
    return { status: "FAILED" as const, duplicate: false };
  }
  return { status: "PENDING" as const, duplicate: false };
}

export async function processPaystackWebhook(rawBody: string, signature: string | null) {
  const secret = getSecretKey();
  if (!signature) throw new Error("PAYSTACK_SIGNATURE_MISSING");
  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(expected, "hex");
  const b = Buffer.from(signature, "hex");
  if (a.length !== b.length || !timingSafeEqual(a, b)) throw new Error("PAYSTACK_SIGNATURE_INVALID");

  const payload = JSON.parse(rawBody) as any;
  if (payload.event !== "charge.success") return { ignored: true };
  const referenceValue = payload.data?.reference;
  if (!referenceValue) throw new Error("PAYSTACK_REFERENCE_MISSING");
  return reconcileSuccess(referenceValue, payload);
}

export async function getPaystackPaymentStatus(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    select: { id: true, status: true, payments: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, provider: true, status: true, amount: true, currency: true, transactionReference: true, failureReason: true, processedAt: true, createdAt: true } } },
  });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  const payment = order.payments[0] ?? null;
  if (payment?.provider === "PAYSTACK" && payment.status === "PROCESSING" && payment.transactionReference) {
    try { await verifyPaystackPayment(payment.transactionReference); } catch { /* webhook remains authoritative if verification is temporarily unavailable */ }
    const refreshed = await prisma.payment.findUnique({ where: { id: payment.id }, select: { id: true, provider: true, status: true, amount: true, currency: true, transactionReference: true, failureReason: true, processedAt: true, createdAt: true } });
    return { orderStatus: (await prisma.order.findUnique({ where: { id: order.id }, select: { status: true } }))?.status ?? order.status, payment: refreshed };
  }
  return { orderStatus: order.status, payment };
}

export function maskPaystackError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message.startsWith("PAYSTACK_API_ERROR:")) return message;
  const known = new Set(["ORDER_NOT_FOUND", "ORDER_NOT_PAYABLE", "PAYMENT_ALREADY_PROCESSING", "INVALID_PAYSTACK_PHONE", "INVALID_PAYMENT_AMOUNT", "PAYSTACK_NOT_CONFIGURED", "PAYSTACK_CHARGE_REJECTED", "PAYSTACK_PROVIDER_UNAVAILABLE"]);
  return known.has(message) ? message : "PAYSTACK_PROVIDER_ERROR";
}
