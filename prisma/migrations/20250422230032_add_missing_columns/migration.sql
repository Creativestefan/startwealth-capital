/*
  Warnings:

  - You are about to drop the column `planType` on the `MarketInvestment` table. All the data in the column will be lost.
  - You are about to alter the column `amount` on the `MarketInvestment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `expectedReturn` on the `MarketInvestment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `actualReturn` on the `MarketInvestment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - A unique constraint covering the columns `[referralCode]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `planId` to the `MarketInvestment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReferralTransactionType" AS ENUM ('PROPERTY_PURCHASE', 'EQUIPMENT_PURCHASE', 'REAL_ESTATE_INVESTMENT', 'GREEN_ENERGY_INVESTMENT', 'MARKET_INVESTMENT');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'COMMISSION_EARNED';
ALTER TYPE "NotificationType" ADD VALUE 'COMMISSION_PAID';
ALTER TYPE "NotificationType" ADD VALUE 'ADMIN_ALERT';
ALTER TYPE "NotificationType" ADD VALUE 'PASSWORD_CHANGED';
ALTER TYPE "NotificationType" ADD VALUE 'PROFILE_UPDATED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionStatus" ADD VALUE 'ACCEPTED';
ALTER TYPE "TransactionStatus" ADD VALUE 'PROCESSING';
ALTER TYPE "TransactionStatus" ADD VALUE 'OUT_FOR_DELIVERY';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'PAYOUT';
ALTER TYPE "TransactionType" ADD VALUE 'PURCHASE';

-- DropIndex
DROP INDEX "MarketInvestment_planType_idx";

-- AlterTable
ALTER TABLE "EquipmentTransaction" ADD COLUMN     "commissionAmount" DECIMAL(10,2),
ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralId" TEXT;

-- AlterTable
ALTER TABLE "GreenEnergyInvestment" ADD COLUMN     "commissionAmount" DECIMAL(10,2),
ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralId" TEXT;

-- AlterTable
ALTER TABLE "MarketInvestment" DROP COLUMN "planType",
ADD COLUMN     "commissionAmount" DECIMAL(10,2),
ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "planId" TEXT NOT NULL,
ADD COLUMN     "referralId" TEXT,
ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "expectedReturn" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "actualReturn" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PropertyTransaction" ADD COLUMN     "commissionAmount" DECIMAL(10,2),
ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralId" TEXT;

-- AlterTable
ALTER TABLE "RealEstateInvestment" ADD COLUMN     "commissionAmount" DECIMAL(10,2),
ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "referralId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT;

-- CreateTable
CREATE TABLE "ReferralCommission" (
    "id" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "transactionType" "ReferralTransactionType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "propertyTransactionId" TEXT,
    "equipmentTransactionId" TEXT,
    "marketInvestmentId" TEXT,
    "realEstateInvestmentId" TEXT,
    "greenEnergyInvestmentId" TEXT,

    CONSTRAINT "ReferralCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReferralSettings" (
    "id" TEXT NOT NULL,
    "propertyCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "equipmentCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "marketCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "greenEnergyCommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" TEXT,
    "updatedBy" TEXT,

    CONSTRAINT "ReferralSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletSettings" (
    "id" TEXT NOT NULL,
    "btcWalletAddress" TEXT,
    "usdtWalletAddress" TEXT,
    "usdtWalletType" TEXT NOT NULL DEFAULT 'BEP-20',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WalletSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "investmentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "paymentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "kycNotifications" BOOLEAN NOT NULL DEFAULT true,
    "referralNotifications" BOOLEAN NOT NULL DEFAULT true,
    "walletNotifications" BOOLEAN NOT NULL DEFAULT true,
    "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
    "commissionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "securityNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MarketInvestmentPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "MarketPlanType" NOT NULL,
    "minAmount" DECIMAL(10,2) NOT NULL,
    "maxAmount" DECIMAL(10,2) NOT NULL,
    "returnRate" DECIMAL(5,2) NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 6,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketInvestmentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivity" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT,
    "amount" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReferralCommission_referralId_idx" ON "ReferralCommission"("referralId");

-- CreateIndex
CREATE INDEX "ReferralCommission_userId_idx" ON "ReferralCommission"("userId");

-- CreateIndex
CREATE INDEX "ReferralCommission_status_idx" ON "ReferralCommission"("status");

-- CreateIndex
CREATE INDEX "ReferralCommission_transactionType_idx" ON "ReferralCommission"("transactionType");

-- CreateIndex
CREATE INDEX "ReferralCommission_propertyTransactionId_idx" ON "ReferralCommission"("propertyTransactionId");

-- CreateIndex
CREATE INDEX "ReferralCommission_equipmentTransactionId_idx" ON "ReferralCommission"("equipmentTransactionId");

-- CreateIndex
CREATE INDEX "ReferralCommission_marketInvestmentId_idx" ON "ReferralCommission"("marketInvestmentId");

-- CreateIndex
CREATE INDEX "ReferralCommission_realEstateInvestmentId_idx" ON "ReferralCommission"("realEstateInvestmentId");

-- CreateIndex
CREATE INDEX "ReferralCommission_greenEnergyInvestmentId_idx" ON "ReferralCommission"("greenEnergyInvestmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PushSubscription_userId_key" ON "PushSubscription"("userId");

-- CreateIndex
CREATE INDEX "PushSubscription_userId_idx" ON "PushSubscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationPreference_userId_key" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "NotificationPreference_userId_idx" ON "NotificationPreference"("userId");

-- CreateIndex
CREATE INDEX "MarketInvestmentPlan_type_idx" ON "MarketInvestmentPlan"("type");

-- CreateIndex
CREATE INDEX "UserActivity_userId_idx" ON "UserActivity"("userId");

-- CreateIndex
CREATE INDEX "UserActivity_type_idx" ON "UserActivity"("type");

-- CreateIndex
CREATE INDEX "UserActivity_timestamp_idx" ON "UserActivity"("timestamp");

-- CreateIndex
CREATE INDEX "EquipmentTransaction_referralId_idx" ON "EquipmentTransaction"("referralId");

-- CreateIndex
CREATE INDEX "GreenEnergyInvestment_referralId_idx" ON "GreenEnergyInvestment"("referralId");

-- CreateIndex
CREATE INDEX "MarketInvestment_planId_idx" ON "MarketInvestment"("planId");

-- CreateIndex
CREATE INDEX "MarketInvestment_referralId_idx" ON "MarketInvestment"("referralId");

-- CreateIndex
CREATE INDEX "PropertyTransaction_referralId_idx" ON "PropertyTransaction"("referralId");

-- CreateIndex
CREATE INDEX "RealEstateInvestment_referralId_idx" ON "RealEstateInvestment"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateIndex
CREATE INDEX "User_referralCode_idx" ON "User"("referralCode");

-- AddForeignKey
ALTER TABLE "MarketInvestment" ADD CONSTRAINT "MarketInvestment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "MarketInvestmentPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "Referral"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_propertyTransactionId_fkey" FOREIGN KEY ("propertyTransactionId") REFERENCES "PropertyTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_equipmentTransactionId_fkey" FOREIGN KEY ("equipmentTransactionId") REFERENCES "EquipmentTransaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_marketInvestmentId_fkey" FOREIGN KEY ("marketInvestmentId") REFERENCES "MarketInvestment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_realEstateInvestmentId_fkey" FOREIGN KEY ("realEstateInvestmentId") REFERENCES "RealEstateInvestment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReferralCommission" ADD CONSTRAINT "ReferralCommission_greenEnergyInvestmentId_fkey" FOREIGN KEY ("greenEnergyInvestmentId") REFERENCES "GreenEnergyInvestment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationPreference" ADD CONSTRAINT "NotificationPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
