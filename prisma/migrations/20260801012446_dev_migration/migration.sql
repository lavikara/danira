-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('ANNOUNCEMENT', 'FEE_REMINDER', 'ATTENDANCE_ALERT', 'EXAM_SCHEDULED', 'TIMETABLE_CHANGE', 'REPORT_CARD_READY', 'GENERAL');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationEntityType" AS ENUM ('ANNOUNCEMENT', 'FEE', 'EXAM', 'TEST', 'ASSIGNMENT', 'TIMETABLE', 'EVENT', 'REPORT_CARD');

-- CreateTable
CREATE TABLE "Notifications" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'NORMAL',
    "schoolId" TEXT,
    "entityType" "NotificationEntityType",
    "entityId" TEXT,
    "actionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotificationRecipients" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotificationRecipients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notifications_schoolId_createdAt_idx" ON "Notifications"("schoolId", "createdAt");

-- CreateIndex
CREATE INDEX "NotificationRecipients_userId_isRead_idx" ON "NotificationRecipients"("userId", "isRead");

-- CreateIndex
CREATE UNIQUE INDEX "NotificationRecipients_notificationId_userId_key" ON "NotificationRecipients"("notificationId", "userId");

-- AddForeignKey
ALTER TABLE "Notifications" ADD CONSTRAINT "Notifications_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "Schools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipients" ADD CONSTRAINT "NotificationRecipients_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationRecipients" ADD CONSTRAINT "NotificationRecipients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
