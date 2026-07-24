/*
  Warnings:

  - You are about to drop the column `schoolsId` on the `Classes` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Classes" DROP CONSTRAINT "Classes_schoolsId_fkey";

-- AlterTable
ALTER TABLE "Classes" DROP COLUMN "schoolsId",
ADD COLUMN     "schoolId" TEXT;

-- AddForeignKey
ALTER TABLE "Classes" ADD CONSTRAINT "Classes_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;
