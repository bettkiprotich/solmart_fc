import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Teams | Solmart FC",
};

export default async function TeamsPage() {
  // First try to find the main club team
  let team = await prisma.team.findFirst({
    where: { isActive: true, name: { contains: "Solmart", mode: "insensitive" } },
  });

  // Fallback to the most recently added team
  if (!team) {
    team = await prisma.team.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "desc" }
    });
  }

  if (team) {
    redirect(`/teams/${team.slug}`);
  }

  // Fallback if no teams exist yet
  return (
    <div className="bg-zinc-50 min-h-screen py-20 text-center">
      <h1 className="text-3xl font-black uppercase tracking-tight md:text-5xl">Our Teams</h1>
      <p className="mt-4 text-lg text-black/60">No teams have been added yet.</p>
    </div>
  );
}
