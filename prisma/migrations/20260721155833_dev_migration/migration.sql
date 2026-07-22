/*
  Warnings:

  - Added the required column `currency` to the `Fees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('NGN', 'USD', 'KES', 'GBP', 'GHS', 'EUR', 'ZAR', 'CAD');

-- AlterTable
ALTER TABLE "Fees" ADD COLUMN     "currency" "Currency" NOT NULL;
