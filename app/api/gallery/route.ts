import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
export async function GET() { return NextResponse.json({ galleries: await prisma.gallery.findMany({ where: { published: true }, include: { images: { orderBy: { sortOrder: "asc" } } }, orderBy: { createdAt: "desc" } }) }); }
