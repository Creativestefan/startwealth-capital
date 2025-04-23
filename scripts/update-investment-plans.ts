const { PrismaClient: PrismaClientClass } = require('@prisma/client')

const prisma = new PrismaClientClass()

async function main() {
  console.log('Updating investment plans with correct durationMonths values...')
  
  // Update all SEMI_ANNUAL plans to have durationMonths = 6
  const semiAnnualUpdated = await prisma.investmentPlan.updateMany({
    where: {
      type: 'SEMI_ANNUAL',
    },
    data: {
      durationMonths: 6,
    },
  })
  
  console.log(`Updated ${semiAnnualUpdated.count} SEMI_ANNUAL plans`)
  
  // Update all ANNUAL plans to have durationMonths = 12
  const annualUpdated = await prisma.investmentPlan.updateMany({
    where: {
      type: 'ANNUAL',
    },
    data: {
      durationMonths: 12,
    },
  })
  
  console.log(`Updated ${annualUpdated.count} ANNUAL plans`)
  
  console.log('Done!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 