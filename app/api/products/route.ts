import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { listActiveProducts } from "@/lib/services/catalog";
import { requireRole } from "@/lib/auth/authorization";
import { productSchema } from "@/lib/validation/api";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const featured = url.searchParams.get("featured");
  const products = await listActiveProducts(featured === "true" ? true : undefined);
  return NextResponse.json({ products });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = productSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid product data.", 422, parsed.error.flatten());
  try {
    const product = await prisma.product.create({ data: parsed.data });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return jsonError("Unable to create product. Check for duplicate slug.", 409);
  }
}
