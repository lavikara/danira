/*
  Warnings:

  - Made the column `code` on table `Subjects` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Subjects" ALTER COLUMN "code" SET NOT NULL;
