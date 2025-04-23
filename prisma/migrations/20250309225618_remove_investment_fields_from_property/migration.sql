/*
  Warnings:

  - You are about to drop the column `expectedReturn` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `maxInvestment` on the `Property` table. All the data in the column will be lost.
  - You are about to drop the column `minInvestment` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Property" DROP COLUMN "expectedReturn",
DROP COLUMN "maxInvestment",
DROP COLUMN "minInvestment";
