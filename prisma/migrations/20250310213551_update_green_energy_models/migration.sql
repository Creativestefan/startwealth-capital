/*
  Warnings:

  - You are about to drop the column `maxOrder` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `minOrder` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `specifications` on the `Equipment` table. All the data in the column will be lost.
  - You are about to drop the column `stock` on the `Equipment` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Equipment` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to drop the column `amount` on the `EquipmentTransaction` table. All the data in the column will be lost.
  - You are about to drop the column `estimatedDelivery` on the `EquipmentTransaction` table. All the data in the column will be lost.
  - The `deliveryAddress` column on the `EquipmentTransaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `features` to the `Equipment` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `images` on the `Equipment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `totalAmount` to the `EquipmentTransaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `GreenEnergyInvestment` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Equipment_price_idx";

-- AlterTable
ALTER TABLE "Equipment" DROP COLUMN "maxOrder",
DROP COLUMN "minOrder",
DROP COLUMN "specifications",
DROP COLUMN "stock",
ADD COLUMN     "features" JSONB NOT NULL,
ADD COLUMN     "stockQuantity" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
DROP COLUMN "images",
ADD COLUMN     "images" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "EquipmentTransaction" DROP COLUMN "amount",
DROP COLUMN "estimatedDelivery",
ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "totalAmount" DECIMAL(10,2) NOT NULL,
DROP COLUMN "deliveryAddress",
ADD COLUMN     "deliveryAddress" JSONB,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "GreenEnergyInvestment" ADD COLUMN     "planId" TEXT NOT NULL,
ALTER COLUMN "startDate" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "endDate" DROP NOT NULL;

-- CreateTable
CREATE TABLE "GreenEnergyPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "GreenEnergyInvestmentType" NOT NULL,
    "minAmount" DECIMAL(10,2) NOT NULL,
    "maxAmount" DECIMAL(10,2) NOT NULL,
    "returnRate" DECIMAL(5,2) NOT NULL,
    "durationMonths" INTEGER NOT NULL DEFAULT 6,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GreenEnergyPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GreenEnergyPlan_type_idx" ON "GreenEnergyPlan"("type");

-- CreateIndex
CREATE INDEX "GreenEnergyInvestment_planId_idx" ON "GreenEnergyInvestment"("planId");

-- AddForeignKey
ALTER TABLE "GreenEnergyInvestment" ADD CONSTRAINT "GreenEnergyInvestment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "GreenEnergyPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
