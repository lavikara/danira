/*
  Warnings:

  - You are about to drop the column `status` on the `Admins` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Guardians` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Staffs` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Students` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "SchoolStatus" ADD VALUE 'ACTIVE';

-- AlterTable
ALTER TABLE "Admins" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Guardians" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Staffs" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Students" DROP COLUMN "status";
