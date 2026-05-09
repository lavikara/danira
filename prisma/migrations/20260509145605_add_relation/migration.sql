-- AlterEnum
ALTER TYPE "Accomodation" ADD VALUE 'STAFFQUARTERS';

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "examId" INTEGER;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam"("id") ON DELETE SET NULL ON UPDATE CASCADE;
