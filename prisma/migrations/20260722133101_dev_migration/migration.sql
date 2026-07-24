/*
  Warnings:

  - The values [COMPULSORY,OPTIONAL] on the enum `SubjectCategory` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `receipt` on the `Fees` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'TRANSFER', 'POS');

-- CreateEnum
CREATE TYPE "PeriodType" AS ENUM ('TEACHING', 'STUDY', 'BREAK', 'BREAKFAST', 'LUNCH', 'DINNER', 'ASSEMBLY', 'RELIGIOUS', 'CoCURRICULAR', 'TEST', 'EXAM');

-- AlterEnum
BEGIN;
CREATE TYPE "SubjectCategory_new" AS ENUM ('CORE', 'ELECTIVE', 'CORE_ELECTIVE');
ALTER TABLE "Subjects" ALTER COLUMN "category" TYPE "SubjectCategory_new" USING ("category"::text::"SubjectCategory_new");
ALTER TYPE "SubjectCategory" RENAME TO "SubjectCategory_old";
ALTER TYPE "SubjectCategory_new" RENAME TO "SubjectCategory";
DROP TYPE "public"."SubjectCategory_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_schoolsId_fkey";

-- DropForeignKey
ALTER TABLE "Departments" DROP CONSTRAINT "Departments_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "FeeStructures" DROP CONSTRAINT "FeeStructures_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Fees" DROP CONSTRAINT "Fees_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Fees" DROP CONSTRAINT "Fees_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "ReportCards" DROP CONSTRAINT "ReportCards_studentId_fkey";

-- DropForeignKey
ALTER TABLE "Staffs" DROP CONSTRAINT "Staffs_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_departmentId_fkey";

-- AlterTable
ALTER TABLE "Fees" DROP COLUMN "receipt",
ADD COLUMN     "receiptId" TEXT;

-- CreateTable
CREATE TABLE "Timetables" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "Duration" NOT NULL DEFAULT 'UPCOMING',
    "schoolId" TEXT NOT NULL,
    "classId" TEXT,
    "gradeYearId" TEXT,
    "termId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Timetables_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimetablePeriods" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "day" "Day" NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "periodType" "PeriodType" NOT NULL,
    "timetableId" TEXT NOT NULL,
    "lessonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimetablePeriods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Receipt" (
    "id" TEXT NOT NULL,
    "receiptNumber" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" "Currency" NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "notes" TEXT,
    "studentId" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "issuedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Timetables_schoolId_classId_termId_key" ON "Timetables"("schoolId", "classId", "termId");

-- CreateIndex
CREATE UNIQUE INDEX "TimetablePeriods_timetableId_day_startTime_key" ON "TimetablePeriods"("timetableId", "day", "startTime");

-- CreateIndex
CREATE UNIQUE INDEX "Receipt_receiptNumber_key" ON "Receipt"("receiptNumber");

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staffs" ADD CONSTRAINT "Staffs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_schoolsId_fkey" FOREIGN KEY ("schoolsId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetables" ADD CONSTRAINT "Timetables_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetables" ADD CONSTRAINT "Timetables_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetables" ADD CONSTRAINT "Timetables_gradeYearId_fkey" FOREIGN KEY ("gradeYearId") REFERENCES "GradeYears"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Timetables" ADD CONSTRAINT "Timetables_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Terms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetablePeriods" ADD CONSTRAINT "TimetablePeriods_timetableId_fkey" FOREIGN KEY ("timetableId") REFERENCES "Timetables"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimetablePeriods" ADD CONSTRAINT "TimetablePeriods_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReportCards" ADD CONSTRAINT "ReportCards_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeeStructures" ADD CONSTRAINT "FeeStructures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_issuedById_fkey" FOREIGN KEY ("issuedById") REFERENCES "Staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
