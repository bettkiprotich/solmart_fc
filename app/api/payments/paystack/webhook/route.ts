import { NextResponse } from "next/server";
import { processPaystackWebhook } from "@/lib/services/paystack";
import { logger } from "@/lib/logging/logger";

export async function POST(request: Request) {
  const rawBody = await request.text();
  try {
    await processPaystackWebhook(rawBody, request.headers.get("x-paystack-signature"));
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    logger.error("Paystack webhook processing failed", error instanceof Error ? { message: error.message } : undefined);
    return NextResponse.json({ error: "Invalid webhook." }, { status: 400 });
  }
}
