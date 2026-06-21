/*
  Warnings:

  - You are about to drop the column `name` on the `SchoolGroups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[groupName]` on the table `SchoolGroups` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `groupName` to the `SchoolGroups` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "UserCondition" ADD VALUE 'DEACTIVATED';

-- DropIndex
DROP INDEX "SchoolGroups_name_key";

-- AlterTable
ALTER TABLE "SchoolGroups" DROP COLUMN "name",
ADD COLUMN     "groupName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "SchoolGroups_groupName_key" ON "SchoolGroups"("groupName");
