/*
  Warnings:

  - Added the required column `status` to the `Admins` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Announcements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Assignments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `attendance` to the `Attendance` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Attendance` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status` to the `Classes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Events` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Exams` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Fees` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Guardians` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Lessons` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `ReportCards` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `SchoolGroups` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isApproved` to the `Schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Schools` table without a default value. This is not possible if the table is not empty.
  - Added the required column `employmentStatus` to the `Staffs` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Staffs` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `status` to the `Students` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Subjects` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Terms` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Tests` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "SchoolStatus" AS ENUM ('BLOCKED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SubjectStatus" AS ENUM ('ACTIVE', 'PURSED');

-- CreateEnum
CREATE TYPE "UserCondition" AS ENUM ('BLOCKED', 'DELETED', 'ACTIVE', 'SUSPENDED', 'EXPELLED', 'GRADUATED', 'MUTUALEXIT', 'SACKED', 'LEAVE');

-- CreateEnum
CREATE TYPE "Condition" AS ENUM ('ACTIVE', 'DELETED', 'CLOSED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "State" AS ENUM ('COMPLETED', 'INCOMPLETE', 'SENT', 'COLLECTED');

-- CreateEnum
CREATE TYPE "Duration" AS ENUM ('UPCOMING', 'STARTED', 'ONGOING', 'ENDED');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PARTIAL', 'PAID', 'UNPAID');

-- CreateEnum
CREATE TYPE "AnnouncementStatus" AS ENUM ('PUBLISHED', 'EXPIRED', 'PENDING');

-- AlterTable
ALTER TABLE "Admins" ADD COLUMN     "status" "UserCondition" NOT NULL;

-- AlterTable
ALTER TABLE "Announcements" ADD COLUMN     "status" "AnnouncementStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Assignments" ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "attendance" "AttendanceStatus" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Classes" ADD COLUMN     "status" "Condition" NOT NULL;

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Exams" ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Fees" ADD COLUMN     "status" "FeeStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Guardians" ADD COLUMN     "status" "UserCondition" NOT NULL;

-- AlterTable
ALTER TABLE "Lessons" ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "ReportCards" ADD COLUMN     "status" "State" NOT NULL;

-- AlterTable
ALTER TABLE "SchoolGroups" ADD COLUMN     "status" "SchoolStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Schools" ADD COLUMN     "isApproved" BOOLEAN NOT NULL,
ADD COLUMN     "status" "SchoolStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Staffs" ADD COLUMN     "employmentStatus" "StaffStatus" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "UserCondition" NOT NULL;

-- AlterTable
ALTER TABLE "Students" ADD COLUMN     "status" "UserCondition" NOT NULL;

-- AlterTable
ALTER TABLE "Subjects" ADD COLUMN     "status" "SubjectStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Terms" ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Tests" ADD COLUMN     "status" "Duration" NOT NULL;

-- AlterTable
ALTER TABLE "Users" ADD COLUMN     "status" "UserCondition" NOT NULL;
