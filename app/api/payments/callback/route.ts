import { NextResponse } from "next/server";
import { processMpesaCallback } from "@/lib/services/mpesa";
import { logger } from "@/lib/logging/logger";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await processMpesaCallback(payload);
    return NextResponse.json({ ResultCode: 0, ResultDesc: result.status === "SUCCESS" ? "Accepted" : "Payment result recorded." });
  } catch (error) {
    logger.error("M-Pesa callback processing failed", error instanceof Error ? { message: error.message } : undefined);
    return NextResponse.json({ ResultCode: 0, ResultDesc: "Callback received." });
  }
}
