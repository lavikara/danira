/*
  Warnings:

  - Added the required column `end` to the `GradeYear` table without a default value. This is not possible if the table is not empty.
  - Added the required column `start` to the `GradeYear` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Accomodation" AS ENUM ('ONCAMPUS', 'OFFCAMPUS');

-- CreateEnum
CREATE TYPE "TermType" AS ENUM ('FIRSTTERM', 'SECONDTERM', 'THIRDTERM');

-- AlterTable
ALTER TABLE "GradeYear" ADD COLUMN     "end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "start" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Staff" ADD COLUMN     "accomodation" "Accomodation";

-- AlterTable
ALTER TABLE "Student" ADD COLUMN     "accomodation" "Accomodation";

-- CreateTable
CREATE TABLE "Term" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "start" TIMESTAMP(3) NOT NULL,
    "end" TIMESTAMP(3) NOT NULL,
    "type" "TermType" NOT NULL,
    "gradeYearId" INTEGER,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_gradeYearId_fkey" FOREIGN KEY ("gradeYearId") REFERENCES "GradeYear"("id") ON DELETE SET NULL ON UPDATE CASCADE;
