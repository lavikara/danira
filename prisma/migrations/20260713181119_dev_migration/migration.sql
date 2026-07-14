/*
  Warnings:

  - You are about to drop the column `staffNumber` on the `Staffs` table. All the data in the column will be lost.
  - You are about to drop the column `subjectId` on the `Students` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Students" DROP CONSTRAINT "Students_subjectId_fkey";

-- AlterTable
ALTER TABLE "Staffs" DROP COLUMN "staffNumber";

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "subjectId";

-- CreateTable
CREATE TABLE "_StudentsToSubjects" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StudentsToSubjects_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_StudentsToSubjects_B_index" ON "_StudentsToSubjects"("B");

-- AddForeignKey
ALTER TABLE "_StudentsToSubjects" ADD CONSTRAINT "_StudentsToSubjects_A_fkey" FOREIGN KEY ("A") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StudentsToSubjects" ADD CONSTRAINT "_StudentsToSubjects_B_fkey" FOREIGN KEY ("B") REFERENCES "Subjects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
