const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const db = new PrismaClient()

async function main() {
  // Create admin user
  // const adminPassword = "$2b$10$o8LiI1H8s7wzx9q7Nb7iaOCknqe4hphchmmz8val.kxXqe7i0x8Zu";
  const adminPassword = await bcrypt.hash("admin123456", 10);
  // admin123456
  const admin = await db.user.upsert({
    where: { email: "admin@startwealth.com" },
    update: {},
    create: {
      email: "admin@startwealth.com",
      firstName: "Admin",
      lastName: "User",
      dateOfBirth: new Date("1990-01-01"),
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
      wallet: {
        create: {
          balance: 0,
        },
      },
    },
  })

  console.log({ admin })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })

