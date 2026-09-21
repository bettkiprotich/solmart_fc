import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
export async function GET() { return NextResponse.json({ teams: await prisma.team.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }) }); }
