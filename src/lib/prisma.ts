import { PrismaClient } from "@prisma/client"

// Configure Prisma Client with options
const prismaClientSingleton = () => {
  return new PrismaClient({
    // Add log levels for debugging if needed
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Disable prepared statements to fix the "prepared statement does not exist" error
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
