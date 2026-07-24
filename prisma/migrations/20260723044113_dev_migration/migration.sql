/*
  Warnings:

  - You are about to drop the column `classesId` on the `Subjects` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `Subjects` table. All the data in the column will be lost.
  - You are about to drop the column `reportCardId` on the `Subjects` table. All the data in the column will be lost.
  - You are about to drop the column `testId` on the `Subjects` table. All the data in the column will be lost.
  - You are about to drop the `_StaffsToSubjects` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[schoolId,name]` on the table `Subjects` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `schoolId` to the `Subjects` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_classesId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_examId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_reportCardId_fkey";

-- DropForeignKey
ALTER TABLE "Subjects" DROP CONSTRAINT "Subjects_testId_fkey";

-- DropForeignKey
ALTER TABLE "_StaffsToSubjects" DROP CONSTRAINT "_StaffsToSubjects_A_fkey";

-- DropForeignKey
ALTER TABLE "_StaffsToSubjects" DROP CONSTRAINT "_StaffsToSubjects_B_fkey";

-- AlterTable
ALTER TABLE "Lessons" ADD COLUMN     "classSubjectId" TEXT;

-- AlterTable
ALTER TABLE "Subjects" DROP COLUMN "classesId",
DROP COLUMN "examId",
DROP COLUMN "reportCardId",
DROP COLUMN "testId",
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_StaffsToSubjects";

-- CreateTable
CREATE TABLE "ClassSubjects" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "staffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassSubjects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ExamsToSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ExamsToSubjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SubjectsToTests" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubjectsToTests_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_ReportCardsToSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ReportCardsToSubjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "ClassSubjects_subjectId_idx" ON "ClassSubjects"("subjectId");

-- CreateIndex
CREATE INDEX "ClassSubjects_staffId_idx" ON "ClassSubjects"("staffId");

-- CreateIndex
CREATE UNIQUE INDEX "ClassSubjects_classId_subjectId_key" ON "ClassSubjects"("classId", "subjectId");

-- CreateIndex
CREATE INDEX "_ExamsToSubjects_B_index" ON "_ExamsToSubjects"("B");

-- CreateIndex
CREATE INDEX "_SubjectsToTests_B_index" ON "_SubjectsToTests"("B");

-- CreateIndex
CREATE INDEX "_ReportCardsToSubjects_B_index" ON "_ReportCardsToSubjects"("B");

-- CreateIndex
CREATE INDEX "Subjects_departmentId_idx" ON "Subjects"("departmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Subjects_schoolId_name_key" ON "Subjects"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjects" ADD CONSTRAINT "ClassSubjects_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjects" ADD CONSTRAINT "ClassSubjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassSubjects" ADD CONSTRAINT "ClassSubjects_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lessons" ADD CONSTRAINT "Lessons_classSubjectId_fkey" FOREIGN KEY ("classSubjectId") REFERENCES "ClassSubjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamsToSubjects" ADD CONSTRAINT "_ExamsToSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Exams"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ExamsToSubjects" ADD CONSTRAINT "_ExamsToSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectsToTests" ADD CONSTRAINT "_SubjectsToTests_A_fkey" FOREIGN KEY ("A") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SubjectsToTests" ADD CONSTRAINT "_SubjectsToTests_B_fkey" FOREIGN KEY ("B") REFERENCES "Tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportCardsToSubjects" ADD CONSTRAINT "_ReportCardsToSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "ReportCards"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ReportCardsToSubjects" ADD CONSTRAINT "_ReportCardsToSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
