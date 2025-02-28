/*
  Warnings:

  - The `status` column on the `MarketInvestment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "RealEstateInvestmentType" AS ENUM ('SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "GreenEnergyInvestmentType" AS ENUM ('SEMI_ANNUAL', 'ANNUAL');

-- CreateEnum
CREATE TYPE "InvestmentStatus" AS ENUM ('ACTIVE', 'MATURED', 'CANCELLED');

-- DropIndex
DROP INDEX "MarketInvestment_status_idx";

-- AlterTable
ALTER TABLE "MarketInvestment" DROP COLUMN "status",
ADD COLUMN     "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE';

-- DropEnum
DROP TYPE "MarketInvestmentStatus";

-- CreateTable
CREATE TABLE "RealEstateInvestment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "RealEstateInvestmentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "expectedReturn" DECIMAL(5,2) NOT NULL,
    "actualReturn" DECIMAL(10,2),
    "reinvest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RealEstateInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GreenEnergyInvestment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "GreenEnergyInvestmentType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "InvestmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "expectedReturn" DECIMAL(5,2) NOT NULL,
    "actualReturn" DECIMAL(10,2),
    "reinvest" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GreenEnergyInvestment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RealEstateInvestment_userId_idx" ON "RealEstateInvestment"("userId");

-- CreateIndex
CREATE INDEX "RealEstateInvestment_status_idx" ON "RealEstateInvestment"("status");

-- CreateIndex
CREATE INDEX "RealEstateInvestment_type_idx" ON "RealEstateInvestment"("type");

-- CreateIndex
CREATE INDEX "GreenEnergyInvestment_userId_idx" ON "GreenEnergyInvestment"("userId");

-- CreateIndex
CREATE INDEX "GreenEnergyInvestment_status_idx" ON "GreenEnergyInvestment"("status");

-- CreateIndex
CREATE INDEX "GreenEnergyInvestment_type_idx" ON "GreenEnergyInvestment"("type");

-- AddForeignKey
ALTER TABLE "RealEstateInvestment" ADD CONSTRAINT "RealEstateInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GreenEnergyInvestment" ADD CONSTRAINT "GreenEnergyInvestment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
