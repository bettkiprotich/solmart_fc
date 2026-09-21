import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getSessionUser } from "@/lib/auth/session";
import { verifyPassword, hashPassword } from "@/lib/security/password";
import { assertSameOrigin } from "@/lib/http/request";
import { jsonError } from "@/lib/http/response";

const schema=z.object({currentPassword:z.string().min(1),newPassword:z.string().min(8).max(200),confirmPassword:z.string().min(8).max(200)}).refine(x=>x.newPassword===x.confirmPassword,{path:["confirmPassword"],message:"Passwords do not match."});
export async function PATCH(request:Request){const e=assertSameOrigin(request);if(e)return e;const user=await getSessionUser();if(!user)return jsonError("Please sign in first.",401);const p=schema.safeParse(await request.json());if(!p.success)return jsonError("Invalid password details.",422,p.error.flatten());const record=await prisma.user.findUnique({where:{id:user.id},select:{passwordHash:true}});if(!record||!(await verifyPassword(p.data.currentPassword,record.passwordHash)))return jsonError("Current password is incorrect.",400);if(p.data.currentPassword===p.data.newPassword)return jsonError("New password must be different from your current password.",422);await prisma.user.update({where:{id:user.id},data:{passwordHash:await hashPassword(p.data.newPassword)}});await prisma.session.deleteMany({where:{userId:user.id}});return NextResponse.json({ok:true,message:"Password changed. Please sign in again."});}
