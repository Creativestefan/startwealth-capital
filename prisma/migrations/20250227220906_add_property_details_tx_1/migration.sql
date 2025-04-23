-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'WALLET_UPDATED';

-- AlterEnum
ALTER TYPE "TransactionStatus" ADD VALUE 'CANCELLED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'INVESTMENT';
ALTER TYPE "TransactionType" ADD VALUE 'RETURN';
ALTER TYPE "TransactionType" ADD VALUE 'COMMISSION';

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "maxOrder" INTEGER,
ADD COLUMN     "minOrder" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "EquipmentTransaction" ADD COLUMN     "estimatedDelivery" TIMESTAMP(3),
ADD COLUMN     "quantity" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "trackingNumber" TEXT;

-- AlterTable
ALTER TABLE "KYC" ADD COLUMN     "reviewedBy" TEXT;

-- AlterTable
ALTER TABLE "MarketInvestment" ADD COLUMN     "reinvest" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "actionUrl" TEXT;

-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "expectedReturn" DOUBLE PRECISION,
ADD COLUMN     "maxInvestment" DOUBLE PRECISION,
ADD COLUMN     "minInvestment" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "PropertyTransaction" ADD COLUMN     "paidInstallments" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "Referral" ADD COLUMN     "commissionPaid" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Wallet" ADD COLUMN     "btcAddress" TEXT,
ADD COLUMN     "usdtAddress" TEXT;

-- AlterTable
ALTER TABLE "WalletTransaction" ADD COLUMN     "description" TEXT;

-- CreateIndex
CREATE INDEX "Equipment_price_idx" ON "Equipment"("price");

-- CreateIndex
CREATE INDEX "EquipmentTransaction_status_idx" ON "EquipmentTransaction"("status");

-- CreateIndex
CREATE INDEX "KYC_status_idx" ON "KYC"("status");

-- CreateIndex
CREATE INDEX "MarketInvestment_planType_idx" ON "MarketInvestment"("planType");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Property_price_idx" ON "Property"("price");

-- CreateIndex
CREATE INDEX "PropertyTransaction_status_idx" ON "PropertyTransaction"("status");

-- CreateIndex
CREATE INDEX "Referral_status_idx" ON "Referral"("status");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Wallet_userId_idx" ON "Wallet"("userId");

-- CreateIndex
CREATE INDEX "WalletTransaction_type_idx" ON "WalletTransaction"("type");
