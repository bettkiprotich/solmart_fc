import { prisma } from "@/lib/db/prisma";
import { ClubHub } from "@/components/club/ClubHub";

export const metadata = {
  title: "Club Information | Solmart FC",
};

export default async function ClubPage() {
  const documents = await prisma.document.findMany({
    orderBy: { createdAt: "desc" }
  });
  
  const sponsors = await prisma.sponsor.findMany({
    where: { active: true },
    orderBy: { displayOrder: "asc" }
  });

  return <ClubHub documents={documents} sponsors={sponsors} />;
}
