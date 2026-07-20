/*
  Warnings:

  - Added the required column `category` to the `Fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schoolId` to the `Fees` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FeeCategory" AS ENUM ('COMPULSORY', 'OPTIONAL');

-- AlterTable
ALTER TABLE "Fees" ADD COLUMN     "category" "FeeCategory" NOT NULL,
ADD COLUMN     "classId" TEXT,
ADD COLUMN     "feeStructureId" TEXT,
ADD COLUMN     "schoolId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "FeeStructures" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" "FeeCategory" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "classType" "ClassType",
    "schoolId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeeStructures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FeeStructures_schoolId_name_key" ON "FeeStructures"("schoolId", "name");

-- AddForeignKey
ALTER TABLE "FeeStructures" ADD CONSTRAINT "FeeStructures_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fees" ADD CONSTRAINT "Fees_feeStructureId_fkey" FOREIGN KEY ("feeStructureId") REFERENCES "FeeStructures"("id") ON DELETE SET NULL ON UPDATE CASCADE;
