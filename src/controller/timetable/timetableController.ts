import { type Request, type Response, type NextFunction } from 'express';
import { getTimetableAnalyticsData } from '../../services/timetableService/timetableAnalyticsService.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { queryTimetableById } from '../../services/timetableService/timetableByIdService.js';
import { PaginatedTimetableQuery } from '../../services/paginationService/paginate.js';

const TIMETABLE_SORTABLE_FIELDS = ['name', 'class'] as const;

const resolveSort = createSortWhitelist(TIMETABLE_SORTABLE_FIELDS, 'name', {
  name: (order) => ({ name: order }),
  class: (order) => ({ class: { name: order } }),
});

const TIMETABLE_INCLUDE = {
  class: {
    select: { id: true, name: true, type: true },
  },
  gradeYear: {
    select: { id: true, level: true },
  },
  term: {
    select: { id: true, name: true, type: true },
  },
  periods: {
    select: {
      id: true,
      name: true,
      day: true,
      startTime: true,
      endTime: true,
      periodType: true,
      lesson: {
        select: {
          id: true,
          name: true,
          day: true,
          status: true,
          startTime: true,
          endTime: true,
          subject: {
            select: { id: true, name: true, code: true, category: true },
          },
          staff: {
            select: {
              id: true,
              position: true,
              users: {
                select: { firstName: true, lastName: true, email: true },
              },
            },
          },
          class: {
            select: { id: true, name: true },
          },
        },
      },
    },
  },
} as const;

const CLASS_TYPE_VALUES = ['PRIMARY', 'SECONDARY', 'TERTIARY'] as const;

const buildTimetableSearchOr = (search: string) => {
  const upperSearch = search.toUpperCase();
  const matchesClassType = (CLASS_TYPE_VALUES as readonly string[]).includes(upperSearch);

  const classOr: Record<string, any>[] = [
    { name: { contains: search, mode: 'insensitive' } },
    { department: { name: { contains: search, mode: 'insensitive' } } },
  ];

  if (matchesClassType) {
    classOr.push({ type: { equals: upperSearch as (typeof CLASS_TYPE_VALUES)[number] } });
  }

  return [
    { name: { contains: search, mode: 'insensitive' } },
    { class: { OR: classOr } },
    { term: { name: { contains: search, mode: 'insensitive' } } },
  ];
};

const shapeTimetable = (timetable: any) => {
  const periods = (timetable.periods ?? []).map((period: any) => {
    const lesson = period.lesson;
    const teacher = lesson?.staff
      ? {
          staffId: lesson.staff.id,
          position: lesson.staff.position,
          name: `${lesson.staff.users?.firstName ?? ''} ${lesson.staff.users?.lastName ?? ''}`.trim(),
          email: lesson.staff.users?.email ?? null,
        }
      : null;

    return {
      periodId: period.id,
      name: period.name,
      day: period.day,
      periodType: period.periodType,
      startTime: period.startTime,
      endTime: period.endTime,
      lessonId: lesson?.id ?? null,
      subject: lesson?.subject
        ? {
            id: lesson.subject.id,
            name: lesson.subject.name,
            code: lesson.subject.code,
            category: lesson.subject.category,
          }
        : null,
      teacher,
      class: lesson?.class ? { id: lesson.class.id, name: lesson.class.name } : null,
      status: lesson?.status ?? null,
    };
  });

  const lessonsById = new Map<string, any>();
  for (const period of timetable.periods ?? []) {
    const lesson = period.lesson;
    if (lesson && !lessonsById.has(lesson.id)) {
      lessonsById.set(lesson.id, {
        id: lesson.id,
        name: lesson.name,
        day: lesson.day,
        status: lesson.status,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        subject: lesson.subject
          ? { id: lesson.subject.id, name: lesson.subject.name, code: lesson.subject.code }
          : null,
        teacher: lesson.staff
          ? {
              staffId: lesson.staff.id,
              name: `${lesson.staff.users?.firstName ?? ''} ${lesson.staff.users?.lastName ?? ''}`.trim(),
            }
          : null,
        class: lesson.class ? { id: lesson.class.id, name: lesson.class.name } : null,
      });
    }
  }

  return {
    id: timetable.id,
    name: timetable.name,
    status: timetable.status,
    schoolId: timetable.schoolId,
    class: timetable.class
      ? { id: timetable.class.id, name: timetable.class.name, type: timetable.class.type }
      : null,
    gradeYear: timetable.gradeYear
      ? { id: timetable.gradeYear.id, level: timetable.gradeYear.level }
      : null,
    term: timetable.term
      ? { id: timetable.term.id, name: timetable.term.name, type: timetable.term.type }
      : null,
    createdAt: timetable.createdAt,
    updatedAt: timetable.updatedAt,
    totalPeriods: periods.length,
    periods,
    lessons: Array.from(lessonsById.values()),
    totalLessons: lessonsById.size,
  };
};

export const allSingleSchoolTimetable = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { name } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && name) where.name = name;

  if (search) {
    where.OR = buildTimetableSearchOr(search as string);
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: TIMETABLE_INCLUDE,
  } satisfies PaginatedTimetableQuery;

  const result = await paginatedResource('timetables', query, 'Fetched all timetables');
  if (!result.success) {
    throw new Error('Unable to fetch timetables');
  }

  res.json({
    ...result,
    data: (result.data as any[]).map(shapeTimetable),
  });
};

export const allGroupSchoolTimetable = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, name } = req.query;
  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) where.schoolId = schoolId;
  if (name) where.name = name;

  if (search) {
    where.OR = buildTimetableSearchOr(search as string);
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: TIMETABLE_INCLUDE,
  } satisfies PaginatedTimetableQuery;

  const result = await paginatedResource('timetables', query, 'Fetched all timetables');

  if (!result.success) {
    throw new Error('Unable to fetch timetables');
  }

  res.json({
    ...result,
    data: (result.data as any[]).map(shapeTimetable),
  });
};

export const getTimetableById = async (req: Request, res: Response, next: NextFunction) => {
  const schoolId = req.params.schoolId;
  const timetableId = req.params.timetableId;
  const details = await queryTimetableById(timetableId as string, schoolId as string);
  if (!details?.success) {
    const error = new ApiError(404, details?.message);
    next(error);
    return;
  }

  if (details?.success) {
    res.status(200).send(new SuccessResponse(details?.message, details?.data));
    return;
  }

  const error = new ApiError(404, 'Schools not found.');
  next(error);
};

export const singleSchoolTimetableAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;

  const timetableWhere: Record<string, any> = {};
  if (schoolId) timetableWhere.schoolId = schoolId;

  const { totalLessons, totalPeriod } = await getTimetableAnalyticsData(timetableWhere);

  const timestamp = new Date().toISOString();

  res.json({
    totalLessons,
    totalPeriod,
    timestamp,
    success: true,
    message: 'timetable analytics fetched.',
  });
};

export const groupTimetableAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const timetableWhere: Record<string, any> = {};
  if (groupId) timetableWhere.school = { groupId };

  const { totalLessons, totalPeriod } = await getTimetableAnalyticsData(timetableWhere);

  const timestamp = new Date().toISOString();

  res.json({
    totalLessons,
    totalPeriod,
    timestamp,
    success: true,
    message: 'timetable analytics fetched.',
  });
};
