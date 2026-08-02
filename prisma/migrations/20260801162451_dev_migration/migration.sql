/*
  Warnings:

  - Changed the type of `bgColor` on the `Notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `icon` on the `Notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `iconColor` on the `Notifications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "NotificationIcon" AS ENUM ('MEGAPHONE_FILL', 'CASH_COIN', 'CASH_STACK', 'PERSON_FILL_EXCLAMATION', 'JOURNAL_CHECK', 'PENCIL_SQUARE', 'CALENDAR2_WEEK_FILL', 'CALENDAR_EVENT_FILL', 'CLIPBOARD2_CHECK_FILL', 'FILE_EARMARK_BAR_GRAPH_FILL', 'INFO_CIRCLE_FILL');

-- CreateEnum
CREATE TYPE "NotificationColor" AS ENUM ('GREEN', 'YELLOW', 'ORANGE', 'RED', 'PURPLE', 'TEAL', 'PINK', 'INDIGO');

-- AlterTable
ALTER TABLE "Notifications" DROP COLUMN "bgColor",
ADD COLUMN     "bgColor" "NotificationColor" NOT NULL,
DROP COLUMN "icon",
ADD COLUMN     "icon" "NotificationIcon" NOT NULL,
DROP COLUMN "iconColor",
ADD COLUMN     "iconColor" "NotificationColor" NOT NULL;
