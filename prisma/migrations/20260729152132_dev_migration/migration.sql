/*
  Warnings:

  - The values [CORE_ELECTIVE] on the enum `SubjectCategory` will be removed. If these variants are still used in the database, this will fail.
  - Added the required column `schoolId` to the `Attendance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "PeriodType" ADD VALUE 'LECTURE';

-- AlterEnum
BEGIN;
CREATE TYPE "SubjectCategory_new" AS ENUM ('CORE', 'ELECTIVE', 'CO_CURRICULAR');
ALTER TABLE "Subjects" ALTER COLUMN "category" TYPE "SubjectCategory_new" USING ("category"::text::"SubjectCategory_new");
ALTER TYPE "SubjectCategory" RENAME TO "SubjectCategory_old";
ALTER TYPE "SubjectCategory_new" RENAME TO "SubjectCategory";
DROP TYPE "public"."SubjectCategory_old";
COMMIT;

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TermType" ADD VALUE 'FIRSTSEMESTER';
ALTER TYPE "TermType" ADD VALUE 'SECONDSEMESTER';

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "schoolId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
