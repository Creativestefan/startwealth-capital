/*
  Warnings:

  - You are about to alter the column `price` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `expectedReturn` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(5,2)`.
  - You are about to alter the column `maxInvestment` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `minInvestment` on the `Property` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `amount` on the `PropertyTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - You are about to alter the column `installmentAmount` on the `PropertyTransaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(10,2)`.
  - Added the required column `mainImage` to the `Property` table without a default value. This is not possible if the table is not empty.
  - Made the column `paidInstallments` on table `PropertyTransaction` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Property" ADD COLUMN     "mainImage" TEXT NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "mapUrl" DROP NOT NULL,
ALTER COLUMN "expectedReturn" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "maxInvestment" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "minInvestment" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "PropertyTransaction" ALTER COLUMN "amount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "installmentAmount" SET DATA TYPE DECIMAL(10,2),
ALTER COLUMN "paidInstallments" SET NOT NULL;
