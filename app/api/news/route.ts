import { NextResponse } from "next/server";
import { listPublishedNews } from "@/lib/services/content";
import { requireRole } from "@/lib/auth/authorization";
import { newsSchema } from "@/lib/validation/api";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category") || undefined;
  const search = url.searchParams.get("q")?.trim() || undefined;
  const articles = await listPublishedNews({ category, search });
  return NextResponse.json({ articles });
}

export async function POST(request: Request) {
  const originError = assertSameOrigin(request);
  if (originError) return originError;
  const admin = await requireRole("ADMIN");
  if (!admin) return jsonError("Administrator access required.", 403);
  const parsed = newsSchema.safeParse(await request.json());
  if (!parsed.success) return jsonError("Invalid article data.", 422, parsed.error.flatten());
  try {
    const data = { ...parsed.data, authorId: parsed.data.authorId || admin.id };
    const article = await prisma.newsArticle.create({ data, include: { category: true } });
    return NextResponse.json({ article }, { status: 201 });
  } catch {
    return jsonError("Unable to create article. Check for duplicate slug or invalid references.", 409);
  }
}
