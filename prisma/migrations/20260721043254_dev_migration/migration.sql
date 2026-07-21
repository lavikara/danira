/*
  Warnings:

  - Added the required column `clockIn` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clockOut` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position` to the `Students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Subjects` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SubjectCategory" AS ENUM ('COMPULSORY', 'OPTIONAL', 'ELECTIVE');

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "clockIn" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "clockOut" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "staffsId" TEXT;

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "position" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Subjects" ADD COLUMN     "category" "SubjectCategory" NOT NULL,
ADD COLUMN     "classesId" TEXT;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_staffsId_fkey" FOREIGN KEY ("staffsId") REFERENCES "Staffs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subjects" ADD CONSTRAINT "Subjects_classesId_fkey" FOREIGN KEY ("classesId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
