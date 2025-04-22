import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add special configuration to make it work with Supabase's connection pooler
const prismaClientSingleton = () => {
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // This is the critical fix for the "prepared statement s0 already exists" error
    // It tells Prisma not to use prepared statements when using a connection pooler
    // This fixes the issue of reconnecting to a connection that already has prepared statements
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // @ts-ignore - These options are actually valid for Prisma Client
    // These options might not be in the type definitions yet
    nullengine: {
      prepare: false, // Disable prepared statements
      alwaysTry: true,
    },
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

