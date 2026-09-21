import { getSessionUser } from "@/lib/auth/session";
import { assertSameOrigin, getClientKey } from "@/lib/http/request";
import { jsonError, jsonOk } from "@/lib/http/response";
import { mpesaPaymentSchema } from "@/lib/validation/ecommerce";
import { initiatePaystackMpesa, maskPaystackError } from "@/lib/services/paystack";
import { checkRateLimit } from "@/lib/security/rate-limit"; // rateLimit compatibility is retained in the security module

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in before paying.", 401);
  if (!checkRateLimit(`paystack:${user.id}:${getClientKey(request)}`, 5, 10 * 60_000).allowed) return jsonError("Too many payment attempts. Please wait and try again.", 429);
  const parsed = mpesaPaymentSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Enter a valid Kenyan M-PESA phone number.", 422);
  try { return jsonOk(await initiatePaystackMpesa(parsed.data.orderId, user.id, parsed.data.phone)); }
  catch (error) {
    const code = maskPaystackError(error);
    if (code === "ORDER_NOT_FOUND") return jsonError("Order not found.", 404);
    if (code === "ORDER_NOT_PAYABLE") return jsonError("This order is no longer awaiting payment.", 409);
    if (code === "PAYMENT_ALREADY_PROCESSING") return jsonError("A payment request is already processing for this order.", 409);
    if (code === "INVALID_PAYSTACK_PHONE") return jsonError("Enter a valid Kenyan M-PESA phone number.", 422);
    if (code === "INVALID_PAYMENT_AMOUNT") return jsonError("This order has an invalid payment amount.", 409);
    if (code === "PAYSTACK_NOT_CONFIGURED") return jsonError("Paystack is not configured on this server yet.", 503);
    if (code === "PAYSTACK_CHARGE_REJECTED") return jsonError("Paystack did not accept the payment request. Please try again.", 502);
    if (code.startsWith("PAYSTACK_API_ERROR:")) {
      const [, status, providerCode, providerMessage] = code.split(":");
      return jsonError(`Paystack response${providerCode ? ` (${providerCode})` : ""}: ${providerMessage || `HTTP ${status}`}`, 502);
    }
    return jsonError("Paystack is temporarily unavailable. Please try again.", 503);
  }
}
