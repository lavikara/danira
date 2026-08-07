/*
  Warnings:

  - Made the column `termId` on table `FeeInvoice` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "FeeInvoice" DROP CONSTRAINT "FeeInvoice_termId_fkey";

-- AlterTable
ALTER TABLE "FeeInvoice" ALTER COLUMN "termId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "FeeInvoice" ADD CONSTRAINT "FeeInvoice_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Terms"("id") ON DELETE CASCADE ON UPDATE CASCADE;
