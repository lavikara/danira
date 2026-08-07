/*
  Warnings:

  - The values [CoCURRICULAR] on the enum `PeriodType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PeriodType_new" AS ENUM ('TEACHING', 'LECTURE', 'STUDY', 'BREAK', 'BREAKFAST', 'LUNCH', 'DINNER', 'ASSEMBLY', 'RELIGIOUS', 'CO_CURRICULAR', 'TEST', 'EXAM');
ALTER TABLE "TimetablePeriods" ALTER COLUMN "periodType" TYPE "PeriodType_new" USING ("periodType"::text::"PeriodType_new");
ALTER TYPE "PeriodType" RENAME TO "PeriodType_old";
ALTER TYPE "PeriodType_new" RENAME TO "PeriodType";
DROP TYPE "public"."PeriodType_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Fees" DROP CONSTRAINT "Fees_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Notifications" DROP CONSTRAINT "Notifications_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "ReportCards" DROP CONSTRAINT "ReportCards_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_departmentId_fkey";

-- AlterTable
ALTER TABLE "FeeStructures" ADD COLUMN     "termId" TEXT;

-- CreateIndex
CREATE INDEX "Fees_schoolId_status_idx" ON "Fees"("schoolId", "status");

-- CreateIndex
CREATE INDEX "Fees_studentId_idx" ON "Fees"("studentId");

-- CreateIndex
CREATE INDEX "Fees_termId_idx" ON "Fees"("termId");

-- CreateIndex
CREATE INDEX "Fees_receiptId_idx" ON "Fees"("receiptId");

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCards" ADD CONSTRAINT "ReportCards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructures" ADD CONSTRAINT "FeeStructures_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE SET NULL ON UPDATE CASCADE;
