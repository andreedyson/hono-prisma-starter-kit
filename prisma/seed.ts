import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../src/configs/env";
import { PrismaClient } from "./generated/prisma/client";
import bcrypt from "bcryptjs";

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
      password: await bcrypt.hash(env.ADMIN_PASSWORD, 12),
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
