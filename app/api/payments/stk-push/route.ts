import { getSessionUser } from "@/lib/auth/session";
import { assertSameOrigin, getClientKey } from "@/lib/http/request";
import { jsonError, jsonOk } from "@/lib/http/response";
import { mpesaPaymentSchema } from "@/lib/validation/ecommerce";
import { initiateMpesaStkPush, maskPaymentError } from "@/lib/services/mpesa";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in before paying.", 401);
  if (!rateLimit(`mpesa:${user.id}:${getClientKey(request)}`, 5, 10 * 60_000)) return jsonError("Too many payment attempts. Please wait and try again.", 429);
  const parsed = mpesaPaymentSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Enter a valid Kenyan M-Pesa phone number.", 422);
  try {
    const result = await initiateMpesaStkPush(parsed.data.orderId, user.id, parsed.data.phone);
    return jsonOk(result, 200);
  } catch (error) {
    const code = maskPaymentError(error);
    if (code === "ORDER_NOT_FOUND") return jsonError("Order not found.", 404);
    if (code === "ORDER_NOT_PAYABLE") return jsonError("This order is no longer awaiting payment.", 409);
    if (code === "PAYMENT_ALREADY_PROCESSING") return jsonError("A payment request is already processing for this order.", 409);
    if (code === "INVALID_MPESA_PHONE") return jsonError("Enter a valid Kenyan M-Pesa phone number.", 422);
    if (code === "INVALID_PAYMENT_AMOUNT") return jsonError("This order has an invalid payment amount.", 409);
    if (code === "MPESA_NOT_CONFIGURED") return jsonError("M-Pesa is not configured on this server yet.", 503);
    if (code === "MPESA_CALLBACK_MUST_USE_HTTPS") return jsonError("M-Pesa production callback must use HTTPS.", 503);
    if (code === "MPESA_STK_REJECTED") return jsonError("M-Pesa did not accept the payment request. Please try again.", 502);
    return jsonError("M-Pesa is temporarily unavailable. Please try again.", 503);
  }
}
