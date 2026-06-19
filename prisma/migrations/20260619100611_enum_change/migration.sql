/*
  Warnings:

  - Changed the type of `status` on the `Classes` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `ReportCards` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "ClassCondition" AS ENUM ('ACTIVE', 'DELETED', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ReportCardState" AS ENUM ('COMPLETED', 'INCOMPLETE');

-- AlterEnum
ALTER TYPE "UserCondition" ADD VALUE 'TRANSFERED';

-- AlterTable
ALTER TABLE "Classes" DROP COLUMN "status",
ADD COLUMN     "status" "ClassCondition" NOT NULL;

-- AlterTable
ALTER TABLE "ReportCards" DROP COLUMN "status",
ADD COLUMN     "status" "ReportCardState" NOT NULL;

-- DropEnum
DROP TYPE "Condition";

-- DropEnum
DROP TYPE "State";
