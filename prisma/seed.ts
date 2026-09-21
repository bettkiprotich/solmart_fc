import { PrismaClient, UserRole, PlayerPosition, FixtureStatus, NewsStatus, ProductStatus } from "@prisma/client";
import { hashPassword } from "../lib/security/password";

const prisma = new PrismaClient();

async function main() {
  const demoPassword = process.env.SEED_DEMO_PASSWORD || "ChangeMe123!";
  const adminPasswordHash = await hashPassword(demoPassword);

  const admin = await prisma.user.upsert({
    where: { email: "admin.demo@solmartfc.local" },
    update: { passwordHash: adminPasswordHash, role: UserRole.ADMIN },
    create: {
      email: "admin.demo@solmartfc.local",
      passwordHash: adminPasswordHash,
      firstName: "Demo",
      lastName: "Administrator",
      role: UserRole.ADMIN,
    },
  });

  const customerPasswordHash = await hashPassword(demoPassword);
  await prisma.user.upsert({
    where: { email: "customer.demo@solmartfc.local" },
    update: { passwordHash: customerPasswordHash, role: UserRole.CUSTOMER },
    create: {
      email: "customer.demo@solmartfc.local",
      passwordHash: customerPasswordHash,
      firstName: "Demo",
      lastName: "Customer",
      role: UserRole.CUSTOMER,
    },
  });

  const solmart = await prisma.team.upsert({
    where: { slug: "solmart-fc" },
    update: { name: "Solmart FC", shortName: "SFC", isClub: true, isActive: true },
    create: { name: "Solmart FC", slug: "solmart-fc", shortName: "SFC", isClub: true },
  });
  const demoOpponent = await prisma.team.upsert({
    where: { slug: "demo-city-fc" },
    update: {},
    create: { name: "Demo City FC", slug: "demo-city-fc", shortName: "DCFC", isClub: true },
  });

  const positions = [
    ["Demo", "Goalkeeper", "demo-goalkeeper", PlayerPosition.GOALKEEPER, 1],
    ["Demo", "Defender", "demo-defender", PlayerPosition.DEFENDER, 4],
    ["Demo", "Midfielder", "demo-midfielder", PlayerPosition.MIDFIELDER, 8],
    ["Demo", "Forward", "demo-forward", PlayerPosition.FORWARD, 9],
  ] as const;
  for (const [firstName, lastName, slug, position, squadNumber] of positions) {
    const player = await prisma.player.upsert({
      where: { slug },
      update: { teamId: solmart.id, isActive: true },
      create: { teamId: solmart.id, firstName, lastName, slug, position, squadNumber, isActive: true },
    });
    await prisma.playerSeasonStatistic.upsert({
      where: { playerId_season: { playerId: player.id, season: "DEMO" } },
      update: { isDemoData: true },
      create: { playerId: player.id, season: "DEMO", appearances: 0, goals: 0, assists: 0, isDemoData: true },
    });
  }

  const competition = await prisma.competition.upsert({
    where: { slug: "competition-tbd-demo" },
    update: { isOfficial: false, description: "Demo competition data only. Solmart FC league participation is not yet confirmed." },
    create: {
      name: "Competition TBD (Demo)",
      slug: "competition-tbd-demo",
      season: "DEMO",
      country: "Kenya",
      isOfficial: false,
      description: "Demo competition data only. Solmart FC league participation is not yet confirmed.",
    },
  });

  const existingFixture = await prisma.fixture.findFirst({ where: { isDemoData: true } });
  if (!existingFixture) {
    await prisma.fixture.create({
      data: {
        competitionId: competition.id,
        homeTeamId: solmart.id,
        awayTeamId: demoOpponent.id,
        kickoffAt: new Date("2030-01-01T15:00:00.000Z"),
        venue: "Demo Venue",
        status: FixtureStatus.SCHEDULED,
        isDemoData: true,
      },
    });
  }

  const category = await prisma.newsCategory.upsert({
    where: { slug: "club-news" },
    update: {},
    create: { name: "Club News", slug: "club-news", description: "Official club updates." },
  });
  await prisma.newsArticle.upsert({
    where: { slug: "demo-welcome-to-solmart-fc" },
    update: { isDemoData: true },
    create: {
      categoryId: category.id,
      authorId: admin.id,
      title: "Demo: Welcome to Solmart FC",
      slug: "demo-welcome-to-solmart-fc",
      excerpt: "Seed content used to verify the news CMS and public API.",
      content: "This is clearly marked demo content and should be replaced through the CMS before production.",
      status: NewsStatus.PUBLISHED,
      publishedAt: new Date(),
      isDemoData: true,
    },
  });

  const product = await prisma.product.upsert({
    where: { slug: "demo-solmart-fc-jersey" },
    update: { status: ProductStatus.ACTIVE, featured: true },
    create: {
      name: "Demo Solmart FC Jersey",
      slug: "demo-solmart-fc-jersey",
      description: "Demo jersey product for testing the merchandise catalogue. Replace with approved merchandise data.",
      category: "Jerseys",
      status: ProductStatus.ACTIVE,
      featured: true,
    },
  });
  for (const size of ["XS", "S", "M", "L", "XL", "XXL"]) {
    await prisma.productVariant.upsert({
      where: { sku: `DEMO-JERSEY-${size}` },
      update: { productId: product.id, stock: 10 },
      create: { productId: product.id, sku: `DEMO-JERSEY-${size}`, size, price: 2500, stock: 10 },
    });
  }

  await prisma.sponsor.upsert({
    where: { id: "demo-solmart-supermarket-sponsor" },
    update: { name: "Solmart Supermarket", active: true },
    create: { id: "demo-solmart-supermarket-sponsor", name: "Solmart Supermarket", description: "Sponsor placement supplied for the website build.", active: true },
  });

  await prisma.siteSetting.upsert({
    where: { key: "club.founded" },
    update: { value: "2024" },
    create: { key: "club.founded", value: "2024", isPublic: true },
  });
  await prisma.siteSetting.upsert({
    where: { key: "club.original_name" },
    update: { value: "KasaCity FC" },
    create: { key: "club.original_name", value: "KasaCity FC", isPublic: true },
  });
  await prisma.siteSetting.upsert({
    where: { key: "club.original_founded" },
    update: { value: "2022" },
    create: { key: "club.original_founded", value: "2022", isPublic: true },
  });

  console.log(`Seed complete. Demo admin: admin.demo@solmartfc.local / ${demoPassword}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
});
