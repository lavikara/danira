/*
  Warnings:

  - The primary key for the `Announcements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Assignments` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Attendance` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Classes` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Events` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Exams` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `GradeYears` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Lessons` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ReportCards` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `depertment` on the `Staffs` table. All the data in the column will be lost.
  - The primary key for the `Subjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Terms` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Tests` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_StaffsToSubjects` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `schoolId` on table `Staffs` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DepartmentStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- DropForeignKey
ALTER TABLE "Announcements" DROP CONSTRAINT "Announcements_classId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_gradeYearId_fkey";

-- DropForeignKey
ALTER TABLE "Events" DROP CONSTRAINT "Events_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_classId_fkey";

-- DropForeignKey
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Staffs" DROP CONSTRAINT "Staffs_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_classId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_examId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_gradeYearId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_subjectId_fkey";

-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_testId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_examId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_reportCardId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_testId_fkey";

-- DropForeignKey
ALTER TABLE "Terms" DROP CONSTRAINT "Terms_gradeYearId_fkey";

-- DropForeignKey
ALTER TABLE "_StaffsToSubjects" DROP CONSTRAINT "_StaffsToSubjects_B_fkey";

-- AlterTable
ALTER TABLE "Announcements" DROP CONSTRAINT "Announcements_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "classId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Announcements_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Announcements_id_seq";

-- AlterTable
ALTER TABLE "Assignments" DROP CONSTRAINT "Assignments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Assignments_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Assignments_id_seq";

-- AlterTable
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "lessonId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Attendance_id_seq";

-- AlterTable
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_pkey",
ADD COLUMN     "departmentId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "gradeYearId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Classes_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Classes_id_seq";

-- AlterTable
ALTER TABLE "Events" DROP CONSTRAINT "Events_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "classId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Events_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Events_id_seq";

-- AlterTable
ALTER TABLE "Exams" DROP CONSTRAINT "Exams_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Exams_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Exams_id_seq";

-- AlterTable
ALTER TABLE "GradeYears" DROP CONSTRAINT "GradeYears_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "GradeYears_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "GradeYears_id_seq";

-- AlterTable
ALTER TABLE "Lessons" DROP CONSTRAINT "Lessons_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "subjectId" SET DATA TYPE TEXT,
ALTER COLUMN "classId" SET DATA TYPE TEXT,
ALTER COLUMN "assignmentId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Lessons_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Lessons_id_seq";

-- AlterTable
ALTER TABLE "ReportCards" DROP CONSTRAINT "ReportCards_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ReportCards_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ReportCards_id_seq";

-- AlterTable
ALTER TABLE "Staffs" DROP COLUMN "depertment",
ADD COLUMN     "departmentId" TEXT,
ALTER COLUMN "schoolId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "departmentId" TEXT,
ALTER COLUMN "classId" SET DATA TYPE TEXT,
ALTER COLUMN "gradeYearId" SET DATA TYPE TEXT,
ALTER COLUMN "examId" SET DATA TYPE TEXT,
ALTER COLUMN "testId" SET DATA TYPE TEXT,
ALTER COLUMN "assignmentId" SET DATA TYPE TEXT,
ALTER COLUMN "subjectId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_pkey",
ADD COLUMN     "departmentId" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "examId" SET DATA TYPE TEXT,
ALTER COLUMN "testId" SET DATA TYPE TEXT,
ALTER COLUMN "reportCardId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Subjects_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Subjects_id_seq";

-- AlterTable
ALTER TABLE "Terms" DROP CONSTRAINT "Terms_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "gradeYearId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Terms_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Terms_id_seq";

-- AlterTable
ALTER TABLE "Tests" DROP CONSTRAINT "Tests_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Tests_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Tests_id_seq";

-- AlterTable
ALTER TABLE "_StaffsToSubjects" DROP CONSTRAINT "_StaffsToSubjects_AB_pkey",
ALTER COLUMN "B" SET DATA TYPE TEXT,
ADD CONSTRAINT "_StaffsToSubjects_AB_pkey" PRIMARY KEY ("A", "B");

-- CreateTable
CREATE TABLE "Departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'ACTIVE',
    "schoolId" TEXT NOT NULL,
    "headId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Departments_headId_key" ON "Departments"("headId");

-- CreateIndex
CREATE UNIQUE INDEX "Departments_schoolId_name_key" ON "Departments"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_headId_fkey" FOREIGN KEY ("headId") REFERENCES "Staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staffs" ADD CONSTRAINT "Staffs_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Staffs" ADD CONSTRAINT "Staffs_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_gradeYearId_fkey" FOREIGN KEY ("gradeYearId") REFERENCES "GradeYears"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Students" ADD CONSTRAINT "Students_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_gradeYearId_fkey" FOREIGN KEY ("gradeYearId") REFERENCES "GradeYears"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Terms" ADD CONSTRAINT "Terms_gradeYearId_fkey" FOREIGN KEY ("gradeYearId") REFERENCES "GradeYears"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Tests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "ReportCards"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "Assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcements" ADD CONSTRAINT "Announcements_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StaffsToSubjects" ADD CONSTRAINT "_StaffsToSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
