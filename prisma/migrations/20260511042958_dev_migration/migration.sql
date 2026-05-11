/*
  Warnings:

  - The values [DANIRAADMIN] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `subjectId` on the `ReportCard` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('SUPERADMIN', 'PLATFORMADMIN', 'SCHOOLADMIN', 'SUBSCHOOLADMIN', 'TEACHER', 'STUDENT', 'GUARDIAN');
ALTER TABLE "Admin" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "Staff" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "Student" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TABLE "Guardian" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "ReportCard" DROP CONSTRAINT "ReportCard_subjectId_fkey";

-- AlterTable
ALTER TABLE "ReportCard" DROP COLUMN "subjectId";

-- AlterTable
ALTER TABLE "Subject" ADD COLUMN     "reportCardId" INTEGER;

-- AddForeignKey
ALTER TABLE "Subject" ADD CONSTRAINT "Subject_reportCardId_fkey" FOREIGN KEY ("reportCardId") REFERENCES "ReportCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
