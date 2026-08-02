/*
  Warnings:

  - Added the required column `bgColor` to the `Notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `icon` to the `Notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iconColor` to the `Notifications` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Notifications" ADD COLUMN     "bgColor" TEXT NOT NULL,
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "iconColor" TEXT NOT NULL;
