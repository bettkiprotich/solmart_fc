import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
export async function GET() { return NextResponse.json({ competitions: await prisma.competition.findMany({ orderBy: { name: "asc" } }) }); }
