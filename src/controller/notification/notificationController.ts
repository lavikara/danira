import { type Request, type Response, type NextFunction } from 'express';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { getNotificationAnalyticsData } from '../../services/notificationService/notificationAnalyticsService.js';
import {
  Prisma,
  NotificationType,
  NotificationPriority,
  NotificationEntityType,
} from '../../generated/browser.js';

const NOTIFICATION_SORTABLE_FIELDS = ['createdAt', 'type', 'priority', 'entityType'] as const;

const resolveSort = createSortWhitelist(NOTIFICATION_SORTABLE_FIELDS, 'createdAt', {
  createdAt: (order) => ({ createdAt: order }),
  type: (order) => ({ type: order }),
  entityType: (order) => ({ entityType: order }),
  priority: (order) => ({ priority: order }),
});

function matchEnumValue<T extends Record<string, string>>(
  enumObj: T,
  search: string,
): T[keyof T] | undefined {
  const normalized = search.trim().toUpperCase();
  return (Object.values(enumObj) as T[keyof T][]).find((value) => value === normalized);
}

function buildNotificationSearchOr(search: string): Prisma.NotificationsWhereInput[] {
  const orConditions: Prisma.NotificationsWhereInput[] = [
    { title: { contains: search, mode: 'insensitive' } },
    { message: { contains: search, mode: 'insensitive' } },
    {
      recipients: {
        some: {
          user: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    },
  ];
  const matchedType = matchEnumValue(NotificationType, search);
  if (matchedType) orConditions.push({ type: matchedType });

  const matchedPriority = matchEnumValue(NotificationPriority, search);
  if (matchedPriority) orConditions.push({ priority: matchedPriority });

  const matchedEntityType = matchEnumValue(NotificationEntityType, search);
  if (matchedEntityType) orConditions.push({ entityType: matchedEntityType });

  return orConditions;
}

export const allSingleSchoolNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;
  const { type, entityType, priority, title } = req.query;

  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (type) where.type = type as NotificationType;
  if (entityType) where.entityType = entityType as NotificationEntityType;
  if (priority) where.priority = priority as NotificationPriority;
  if (title) where.title = title as string;

  if (search) {
    where.OR = buildNotificationSearchOr(search as string);
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      recipients: true,
    },
  };

  const result = await paginatedResource('notifications', query, 'Fetched all Notifications');
  if (!result.success) {
    throw new Error('Unable to fetch notifications');
  }

  res.json(result);
};

export const allGroupSchoolNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;
  const { schoolId, type, entityType, priority, title } = req.query;

  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) where.schoolId = schoolId as string;
  if (type) where.type = type as NotificationType;
  if (entityType) where.entityType = entityType as NotificationEntityType;
  if (priority) where.priority = priority as NotificationPriority;
  if (title) where.title = title as string;

  if (search) {
    where.OR = buildNotificationSearchOr(search as string);
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      recipients: { include: { user: true } },
    },
  };

  const result = await paginatedResource('notifications', query, 'Fetched all Notifications');
  if (!result.success) {
    throw new Error('Unable to fetch notifications');
  }

  res.json(result);
};

export const singleSchoolNotificationAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;

  const notiWhere: Record<string, any> = {};
  if (schoolId) notiWhere.schoolId = schoolId;

  const analytics = await getNotificationAnalyticsData(notiWhere);
  const timestamp = new Date().toISOString();

  res.json({
    ...analytics,
    timestamp,
    success: true,
    message: 'Notification analytics fetched.',
  });
};

export const groupNotificationAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { groupId } = req.params;
  const schoolIds = req.schoolIds as string[] | undefined;

  const notiWhere: Record<string, any> = {};
  if (groupId) notiWhere.school = { groupId };
  if (schoolIds?.length) notiWhere.schoolId = { in: schoolIds };

  const analytics = await getNotificationAnalyticsData(notiWhere);
  const timestamp = new Date().toISOString();

  res.json({
    ...analytics,
    timestamp,
    success: true,
    message: 'Notification analytics fetched.',
  });
};
