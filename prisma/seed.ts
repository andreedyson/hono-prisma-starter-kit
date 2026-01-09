import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../src/configs/env";
import { PrismaClient } from "./generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: env.DATABASE_URL }),
});

async function main() {
  console.log("🌱 Start Seeding...");

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@gmail.com",
    },
    update: {},
    create: {
      name: "Admin",
      email: "admin@gmail.com",
      password: env.ADMIN_PASSWORD,
      role: "ADMIN",
    },
    select: {
      name: true,
      email: true,
    },
  });
  console.log("⚙️ Admin Created", { admin });

  console.log("✅ Seeding Finished...");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
