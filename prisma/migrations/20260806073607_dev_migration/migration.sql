/*
  Warnings:

  - Added the required column `currency` to the `FeeStructures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FeeStructures" ADD COLUMN     "currency" "Currency" NOT NULL;
