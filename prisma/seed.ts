const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const db = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10)
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

