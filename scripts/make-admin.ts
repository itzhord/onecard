import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2];

  if (!email) {
    console.error("Please provide an email address as an argument.");
    console.error("Usage: npx tsx scripts/make-admin.ts <email>");
    process.exit(1);
  }

  console.log(`Looking for user with email: ${email}...`);

  const user = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

  if (!user) {
    console.error(`User with email ${email} not found.`);
    process.exit(1);
  }

  console.log(`Found user: ${user.name} (${user.id})`);
  console.log(`Current role: ${user.role}`);

  if (user.role === "admin") {
    console.log("User is already an admin.");
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { role: "admin" },
  });

  console.log(`✅ Successfully promoted ${email} to admin!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
