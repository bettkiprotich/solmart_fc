import { prisma } from "../lib/db/prisma";
import { hashPassword } from "../lib/security/password";

async function main() {
  const email = "admin@solmartfc.com";
  const password = "Admin";
  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: "ADMIN",
      firstName: "Admin",
    },
    create: {
      email,
      passwordHash,
      role: "ADMIN",
      firstName: "Admin",
    },
  });

  console.log("Admin user created/updated successfully:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
