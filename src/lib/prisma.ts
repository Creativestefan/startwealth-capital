import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ["query", "error", "warn"], // Enable logging
  })
}

export const prisma = globalThis.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma
}

