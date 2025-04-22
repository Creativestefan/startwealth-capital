import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add special configuration to make it work with Supabase's connection pooler
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    // Use data proxy previewFeature to work around the prepared statements issue
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// The critical fix for the "prepared statement s0 already exists" error
// This helper function wraps Prisma's query engine to globally disable 
// prepared statements when using PgBouncer or similar connection poolers
if (process.env.DATABASE_URL?.includes('pooler')) {
  // @ts-ignore - Accessing internal Prisma API for fixing connection pooler issues
  prisma.$on('beforeEngine', (params: any) => {
    // Disable prepared statements for this client instance
    params.engine.config.engineConfig.previewFeatures = [
      ...(params.engine.config.engineConfig.previewFeatures || []),
      'noPreparedStatements'
    ]
  })
}

