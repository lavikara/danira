-- AlterTable
ALTER TABLE "Fees" ADD COLUMN     "termId" TEXT;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;
