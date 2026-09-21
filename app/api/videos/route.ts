import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
export async function GET() { return NextResponse.json({ videos: await prisma.video.findMany({ where: { published: true }, orderBy: { createdAt: "desc" } }) }); }
