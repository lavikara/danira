import { Prisma, NotificationPriority } from '../../generated/browser.js';
import { prismaClient } from '../dbServices/dbClient/prismaClient.js';

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export interface NotificationAnalytics {
  unreadCount: number;
  last30DaysTotal: number;
  avgOpenRateLast30Days: number;
  totalReach: number;
  byPriority: Record<string, number>;
  byType: Record<string, number>;
}

interface PriorityCount {
  priority: NotificationPriority;
  _count: { _all: number };
}

interface TypeCount {
  type: string;
  _count: { _all: number };
}

export const getNotificationAnalyticsData = async (
  notificationWhere: Prisma.NotificationsWhereInput,
): Promise<NotificationAnalytics> => {
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const last30DaysWhere: Prisma.NotificationsWhereInput = {
    ...notificationWhere,
    createdAt: { gte: thirtyDaysAgo },
  };

  const [unreadCount, last30DaysTotal, recipientsLast30Total, recipientsLast30Read] =
    await Promise.all([
      prismaClient.notificationRecipients.count({
        where: { isRead: false, notification: notificationWhere },
      }),
      prismaClient.notifications.count({ where: last30DaysWhere }),
      prismaClient.notificationRecipients.count({
        where: { notification: last30DaysWhere },
      }),
      prismaClient.notificationRecipients.count({
        where: { notification: last30DaysWhere, isRead: true },
      }),
    ]);

  const distinctRecipients = await prismaClient.notificationRecipients.findMany({
    where: { notification: last30DaysWhere },
    select: { userId: true },
  });
  const totalReach = distinctRecipients.length;

  const [priorityGroups, typeGroups] = (await Promise.all([
    prismaClient.notifications.groupBy({
      by: ['priority'],
      where: notificationWhere,
      _count: { _all: true },
    }),
    prismaClient.notifications.groupBy({
      by: ['type'],
      where: notificationWhere,
      _count: { _all: true },
    }),
  ])) as [PriorityCount[], TypeCount[]];

  const avgOpenRateLast30Days =
    recipientsLast30Total > 0
      ? Math.round((recipientsLast30Read / recipientsLast30Total) * 1000) / 10
      : 0;

  const byPriority = Object.fromEntries(
    priorityGroups.map((group) => [group.priority, group._count._all]),
  );

  const byType = Object.fromEntries(typeGroups.map((group) => [group.type, group._count._all]));

  return {
    unreadCount,
    last30DaysTotal,
    avgOpenRateLast30Days,
    totalReach,
    byPriority,
    byType,
  };
};
