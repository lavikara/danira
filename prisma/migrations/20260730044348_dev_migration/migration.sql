/*
  Warnings:

  - You are about to drop the `Attendance` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterEnum
ALTER TYPE "AttendanceStatus" ADD VALUE 'LATE';

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_lessonId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_schoolId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_staffsId_fkey";

-- DropForeignKey
ALTER TABLE "Attendance" DROP CONSTRAINT "Attendance_studentId_fkey";

-- DropTable
DROP TABLE "Attendance";

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "attendance" "AttendanceStatus" NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "lessonId" TEXT,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffAttendance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "schoolId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "StaffAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LessonAttendance" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL,
    "clockIn" TIMESTAMP(3),
    "clockOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lessonId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,

    CONSTRAINT "LessonAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudentAttendance_schoolId_date_idx" ON "StudentAttendance"("schoolId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_lessonId_date_key" ON "StudentAttendance"("studentId", "lessonId", "date");

-- CreateIndex
CREATE INDEX "StaffAttendance_schoolId_date_idx" ON "StaffAttendance"("schoolId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffAttendance_staffId_date_key" ON "StaffAttendance"("staffId", "date");

-- CreateIndex
CREATE INDEX "LessonAttendance_staffId_date_idx" ON "LessonAttendance"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "LessonAttendance_lessonId_staffId_date_key" ON "LessonAttendance"("lessonId", "staffId", "date");

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffAttendance" ADD CONSTRAINT "StaffAttendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttendance" ADD CONSTRAINT "LessonAttendance_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonAttendance" ADD CONSTRAINT "LessonAttendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staffs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
