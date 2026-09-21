import { createHash } from "node:crypto";
import { prisma } from "@/lib/db/prisma";

const MPESA_TIMEOUT_MS = 15_000;

type MpesaConfig = {
  environment: "sandbox" | "production";
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  callbackUrl: string;
};

function getConfig(): MpesaConfig {
  const environment = process.env.MPESA_ENVIRONMENT === "production" ? "production" : "sandbox";
  const values = {
    environment,
    consumerKey: process.env.MPESA_CONSUMER_KEY,
    consumerSecret: process.env.MPESA_CONSUMER_SECRET,
    shortcode: process.env.MPESA_SHORTCODE,
    passkey: process.env.MPESA_PASSKEY,
    callbackUrl: process.env.MPESA_CALLBACK_URL,
  };
  const missing = Object.entries(values).filter(([key, value]) => key !== "environment" && !value).map(([key]) => key);
  if (missing.length) throw new Error(`MPESA_NOT_CONFIGURED:${missing.join(",")}`);
  if (environment === "production" && !values.callbackUrl!.startsWith("https://")) {
    throw new Error("MPESA_CALLBACK_MUST_USE_HTTPS");
  }
  return values as MpesaConfig;
}

function baseUrl(environment: MpesaConfig["environment"]) {
  return environment === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
}

async function fetchWithTimeout(url: string, init: RequestInit) {
  return fetch(url, { ...init, signal: AbortSignal.timeout(MPESA_TIMEOUT_MS) });
}

async function getAccessToken(config: MpesaConfig) {
  const credentials = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString("base64");
  const response = await fetchWithTimeout(`${baseUrl(config.environment)}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${credentials}` },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`MPESA_OAUTH_HTTP_${response.status}`);
  const data = await response.json() as { access_token?: string };
  if (!data.access_token) throw new Error("MPESA_OAUTH_NO_TOKEN");
  return data.access_token;
}

function normalizePhone(phone: string) {
  const compact = phone.replace(/[\s()-]/g, "");
  if (/^0\d{9}$/.test(compact)) return `254${compact.slice(1)}`;
  if (/^\+254\d{9}$/.test(compact)) return compact.slice(1);
  if (/^254\d{9}$/.test(compact)) return compact;
  throw new Error("INVALID_MPESA_PHONE");
}

function timestamp() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return `${values.year}${values.month}${values.day}${values.hour}${values.minute}${values.second}`;
}

function password(shortcode: string, passkey: string, time: string) {
  return Buffer.from(`${shortcode}${passkey}${time}`).toString("base64");
}

export async function initiateMpesaStkPush(orderId: string, userId: string, phone: string) {
  const config = getConfig();
  const normalizedPhone = normalizePhone(phone);
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: { payments: { where: { status: "PROCESSING" }, orderBy: { createdAt: "desc" }, take: 1 } } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  if (order.status !== "PENDING_PAYMENT") throw new Error("ORDER_NOT_PAYABLE");
  if (order.payments[0]) throw new Error("PAYMENT_ALREADY_PROCESSING");

  const amount = Number(order.total);
  if (!Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) throw new Error("INVALID_PAYMENT_AMOUNT");

  const payment = await prisma.payment.create({
    data: { orderId: order.id, provider: "MPESA", status: "PENDING", amount, currency: order.currency, phoneNumber: normalizedPhone },
  });

  const time = timestamp();
  try {
    const token = await getAccessToken(config);
    const response = await fetchWithTimeout(`${baseUrl(config.environment)}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: config.shortcode,
        Password: password(config.shortcode, config.passkey, time),
        Timestamp: time,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: normalizedPhone,
        PartyB: config.shortcode,
        PhoneNumber: normalizedPhone,
        CallBackURL: config.callbackUrl,
        AccountReference: order.orderNumber,
        TransactionDesc: `Solmart FC order ${order.orderNumber}`,
      }),
    });
    const providerResponse = await response.json().catch(() => ({}));
    if (!response.ok || providerResponse.ResponseCode !== "0") {
      await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: providerResponse.ResponseDescription ?? `HTTP ${response.status}`, providerResponse } });
      throw new Error("MPESA_STK_REJECTED");
    }

    const updated = await prisma.payment.update({ where: { id: payment.id }, data: { status: "PROCESSING", checkoutRequestId: providerResponse.CheckoutRequestID, merchantRequestId: providerResponse.MerchantRequestID, providerResponse } });
    return { paymentId: updated.id, checkoutRequestId: updated.checkoutRequestId, customerMessage: providerResponse.CustomerMessage ?? "STK Push sent. Complete the payment on your phone." };
  } catch (error) {
    if (error instanceof Error && ["MPESA_STK_REJECTED", "MPESA_NOT_CONFIGURED", "MPESA_CALLBACK_MUST_USE_HTTPS", "INVALID_MPESA_PHONE", "INVALID_PAYMENT_AMOUNT"].includes(error.message)) throw error;
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: "Unable to reach M-Pesa provider." } }).catch(() => undefined);
    throw new Error("MPESA_PROVIDER_UNAVAILABLE");
  }
}

export async function processMpesaCallback(payload: unknown) {
  const body = payload as { Body?: { stkCallback?: { MerchantRequestID?: string; CheckoutRequestID?: string; ResultCode?: number; ResultDesc?: string; CallbackMetadata?: { Item?: Array<{ Name?: string; Value?: string | number }> } } } };
  const callback = body?.Body?.stkCallback;
  if (!callback?.CheckoutRequestID || typeof callback.ResultCode !== "number") throw new Error("INVALID_MPESA_CALLBACK");

  const payment = await prisma.payment.findUnique({ where: { checkoutRequestId: callback.CheckoutRequestID }, include: { order: true } });
  if (!payment) throw new Error("PAYMENT_NOT_FOUND");
  if (payment.provider !== "MPESA") throw new Error("PAYMENT_PROVIDER_MISMATCH");
  if (payment.merchantRequestId && callback.MerchantRequestID && payment.merchantRequestId !== callback.MerchantRequestID) throw new Error("MPESA_MERCHANT_REQUEST_MISMATCH");
  if (payment.status === "SUCCESS") return { duplicate: true, status: "SUCCESS" as const };

  const items = callback.CallbackMetadata?.Item ?? [];
  const value = (name: string) => items.find(item => item.Name === name)?.Value;
  const amount = value("Amount");
  const receipt = value("MpesaReceiptNumber");
  const phone = value("PhoneNumber");

  if (callback.ResultCode === 0) {
    if (typeof receipt !== "string" || !receipt) throw new Error("MPESA_SUCCESS_MISSING_RECEIPT");
    if (amount !== undefined && Number(amount) !== Number(payment.amount)) throw new Error("MPESA_AMOUNT_MISMATCH");
    if (phone !== undefined && String(phone) !== String(payment.phoneNumber)) throw new Error("MPESA_PHONE_MISMATCH");

    await prisma.$transaction(async tx => {
      const current = await tx.payment.findUnique({ where: { id: payment.id }, include: { order: true } });
      if (!current) throw new Error("PAYMENT_NOT_FOUND");
      if (current.status === "SUCCESS") return;
      await tx.payment.update({ where: { id: current.id }, data: { status: "SUCCESS", transactionReference: receipt, providerReceipt: receipt, providerResponse: payload as object, processedAt: new Date(), failureReason: null } });
      await tx.order.updateMany({ where: { id: current.orderId, status: "PENDING_PAYMENT" }, data: { status: "PAID" } });
    });
    return { duplicate: false, status: "SUCCESS" as const };
  }

  await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED", failureReason: callback.ResultDesc ?? "M-Pesa payment failed.", providerResponse: payload as object, processedAt: new Date() } });
  return { duplicate: false, status: "FAILED" as const };
}

export async function getPaymentStatus(orderId: string, userId: string) {
  const order = await prisma.order.findFirst({ where: { id: orderId, userId }, select: { id: true, status: true, payments: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, status: true, amount: true, currency: true, transactionReference: true, checkoutRequestId: true, failureReason: true, processedAt: true, createdAt: true } } } });
  if (!order) throw new Error("ORDER_NOT_FOUND");
  return { orderStatus: order.status, payment: order.payments[0] ?? null };
}

export function maskPaymentError(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  const known = new Set(["ORDER_NOT_FOUND", "ORDER_NOT_PAYABLE", "PAYMENT_ALREADY_PROCESSING", "INVALID_MPESA_PHONE", "INVALID_PAYMENT_AMOUNT", "MPESA_NOT_CONFIGURED", "MPESA_CALLBACK_MUST_USE_HTTPS", "MPESA_STK_REJECTED", "MPESA_PROVIDER_UNAVAILABLE"]);
  return known.has(message) ? message : "MPESA_PROVIDER_ERROR";
}
