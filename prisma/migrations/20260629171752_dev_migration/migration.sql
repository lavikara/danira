/*
  Warnings:

  - Added the required column `country` to the `Schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `termsConditions` to the `Schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Schools" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "termsConditions" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;
