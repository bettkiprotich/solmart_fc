import { getSessionUser } from "@/lib/auth/session";
import { jsonError, jsonOk } from "@/lib/http/response";
import { getPaystackPaymentStatus } from "@/lib/services/paystack";

export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) return jsonError("Please sign in.", 401);
  const orderId = new URL(request.url).searchParams.get("orderId");
  if (!orderId) return jsonError("orderId is required.", 400);
  try { return jsonOk(await getPaystackPaymentStatus(orderId, user.id)); }
  catch { return jsonError("Order not found.", 404); }
}
