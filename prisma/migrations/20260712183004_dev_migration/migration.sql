/*
  Warnings:

  - You are about to drop the column `studentNumber` on the `Students` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Staffs" ADD COLUMN     "staffNumber" TEXT;

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "studentNumber";

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "ratings" DOUBLE PRECISION NOT NULL DEFAULT 0;
