import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/authorization";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";
import { uniqueSlug } from "@/lib/services/slug";

const variant = z.object({
  id: z.string().cuid().optional(),
  sku: z.string().min(1).max(80),
  size: z.string().max(20).nullable().optional(),
  price: z.coerce.number().min(0),
  salePrice: z.coerce.number().min(0).nullable().optional(),
  stock: z.coerce.number().int().min(0),
});

const schema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(180).optional(),
  description: z.string().max(5000).nullable().optional(),
  category: z.string().min(1).max(80),
  status: z.enum(["DRAFT", "ACTIVE", "OUT_OF_STOCK", "ARCHIVED"]).default("DRAFT"),
  featured: z.boolean().default(false),
  variants: z.array(variant).optional(),
});

export async function GET(request: Request) {
  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "100");
  const skip = (page - 1) * limit;

  const products = await prisma.product.findMany({
    include: { variants: true, images: true },
    orderBy: { updatedAt: "desc" },
    take: limit,
    skip,
  });

  const total = await prisma.product.count();

  return NextResponse.json({ products, pagination: { total, page, limit, pages: Math.ceil(total / limit) } });
}

export async function POST(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const p = schema.safeParse(await request.json());
  if (!p.success) return jsonError("Invalid product data.", 422, p.error.flatten());

  try {
    const product = await prisma.product.create({
      data: {
        name: p.data.name,
        slug: await uniqueSlug(p.data.name, "product"),
        description: p.data.description,
        category: p.data.category,
        status: p.data.status,
        featured: p.data.featured,
        variants: {
          create: (p.data.variants ?? []).map((v) => ({
            sku: v.sku,
            size: v.size,
            price: v.price,
            salePrice: v.salePrice,
            stock: v.stock,
          })),
        },
      },
      include: { variants: true, images: true },
    });
    return NextResponse.json({ product }, { status: 201 });
  } catch {
    return jsonError("Unable to save product. Check duplicate slug/SKU.", 409);
  }
}

export async function PATCH(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Product id is required.", 422);

  const body = await request.json();
  const p = schema.partial().safeParse(body);
  if (!p.success) return jsonError("Invalid product data.", 422, p.error.flatten());

  try {
    const product = await prisma.$transaction(async (tx) => {
      const updated = await tx.product.update({
        where: { id },
        data: {
          name: p.data.name,
          slug: p.data.name ? await uniqueSlug(p.data.name, "product", id) : undefined,
          description: p.data.description,
          category: p.data.category,
          status: p.data.status,
          featured: p.data.featured,
        },
      });

      if (p.data.variants) {
        for (const v of p.data.variants) {
          if (v.id) {
            await tx.productVariant.update({
              where: { id: v.id },
              data: { sku: v.sku, size: v.size, price: v.price, salePrice: v.salePrice, stock: v.stock },
            });
          } else {
            await tx.productVariant.create({
              data: { productId: id, sku: v.sku, size: v.size, price: v.price, salePrice: v.salePrice, stock: v.stock },
            });
          }
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: { variants: true, images: true },
      });
    });

    return NextResponse.json({ product });
  } catch {
    return jsonError("Unable to update product.", 409);
  }
}

export async function DELETE(request: Request) {
  const e = assertSameOrigin(request);
  if (e) return e;

  const a = await requireRole("ADMIN");
  if (!a) return jsonError("Administrator access required.", 403);

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return jsonError("Product id is required.", 422);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        include: { variants: { select: { id: true } } },
      });
      if (!product) return null;

      const variantIds = product.variants.map((v) => v.id);
      const [cartItems, orderItems] = variantIds.length
        ? [
            await tx.cartItem.count({ where: { variantId: { in: variantIds } } }),
            await tx.orderItem.count({ where: { variantId: { in: variantIds } } }),
          ]
        : [0, 0];

      if (cartItems > 0 || orderItems > 0) {
        const archived = await tx.product.update({ where: { id }, data: { status: "ARCHIVED" } });
        return { mode: "archived", product: archived };
      }

      await tx.product.delete({ where: { id } });
      return { mode: "deleted", product: null };
    });

    if (!result) return jsonError("Product not found.", 404);

    return NextResponse.json({
      success: true,
      mode: result.mode,
      message: result.mode === "deleted" ? "Product removed successfully." : "Product has existing cart/order records, so it was archived instead of deleted.",
    });
  } catch {
    return jsonError("Unable to remove product. Please try again.", 409);
  }
}
