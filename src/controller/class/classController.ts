import { type Request, type Response, type NextFunction } from 'express';
import { getClassAnalyticsData } from '../../services/classService/classAnalyticsService.js';
import { ChartJsData, PaginatedClassQuery } from '../../types/definitions.js';
import { toChartData } from '../../utils/analytics.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';

const CLASSES_SORTABLE_FIELDS = ['population', 'name'] as const;

const resolveSort = createSortWhitelist(CLASSES_SORTABLE_FIELDS, 'name', {
  name: (order) => ({ name: order }),
  population: (order) => ({ population: order }),
});

export const allSingleSchoolClass = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { name, department } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && name) where.name = name;
  if (schoolId && department) where.department = { name: department };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      {
        supervisor: {
          users: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      supervisor: {
        select: {
          users: { select: { firstName: true, lastName: true } },
        },
      },
      subjectOfferings: { select: { subject: true } },
      department: { select: { name: true } },
      students: {
        take: 1,
        select: {
          fees: {
            where: { category: 'COMPULSORY' },
            select: { amount: true, currency: true },
          },
        },
      },
    },
  } satisfies PaginatedClassQuery;

  const result = await paginatedResource('classes', query, 'Fetched all classes');
  if (!result.success) {
    throw new Error('Unable to fetch classes');
  }

  // @ts-expect-error - Fix typescript infrence for relations
  const data = result.data.map(({ students, subjectOfferings, ...classItem }) => {
    const compulsoryFees = students[0]?.fees ?? [];
    return {
      ...classItem,
      subjectOfferings,
      subjectCount: subjectOfferings.length,
      compulsoryFeesAmount: {
        amount: compulsoryFees.reduce(
          (sum: number, fee: { amount: number }) => sum + fee.amount,
          0,
        ),
        currency: compulsoryFees[0]?.currency ?? null,
      },
    };
  });

  // @ts-expect-error - result.data's inferred type doesn't reflect the reshaped data above
  result.data = data;

  res.json(result);
};

export const singleSchoolClassAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;

  const classWhere: Record<string, any> = {};
  if (schoolId) classWhere.schoolId = schoolId;

  const {
    totalClasses,
    averageClassSize,
    averagePerformance,
    averageAttendance,
    topClassesByPopulation,
  } = await getClassAnalyticsData(classWhere);

  const classChartItems = topClassesByPopulation.map((classItem) => ({
    label: classItem.name || classItem.classId,
    value: classItem.population,
  }));
  const chartBorderRadious = 7;
  const studentByClassChart: ChartJsData = toChartData(
    classChartItems,
    'Students',
    chartBorderRadious,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalClasses,
    averageClassSize,
    averagePerformance,
    averageAttendance,
    topClassesByPopulation: {
      chart: studentByClassChart,
    },
    timestamp,
    success: true,
    message: 'class analytics fetched.',
  });
};

export const allGroupSchoolClass = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, name, department } = req.query;
  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) where.schoolId = schoolId;
  if (name) where.name = name;
  if (department) where.department = { name: department };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      {
        supervisor: {
          staffId: { contains: search as string, mode: 'insensitive' },
          users: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      supervisor: {
        select: {
          users: { select: { firstName: true, lastName: true } },
        },
      },
      subjectOfferings: { select: { subject: true } },
      department: { select: { name: true } },
      students: {
        take: 1,
        select: {
          fees: {
            where: { category: 'COMPULSORY' },
            select: { amount: true, currency: true },
          },
        },
      },
    },
  } satisfies PaginatedClassQuery;

  const result = await paginatedResource('classes', query, 'Fetched all classes');

  if (!result.success) {
    throw new Error('Unable to fetch classes');
  }

  // @ts-expect-error - Fix typescript infrence for relations
  const data = result.data.map(({ students, subjectOfferings, ...classItem }) => {
    const compulsoryFees = students[0]?.fees ?? [];
    return {
      ...classItem,
      subjectOfferings,
      subjectCount: subjectOfferings.length,
      compulsoryFeesAmount: {
        amount: compulsoryFees.reduce(
          (sum: number, fee: { amount: number }) => sum + fee.amount,
          0,
        ),
        currency: compulsoryFees[0]?.currency ?? null,
      },
    };
  });

  // @ts-expect-error - result.data's inferred type doesn't reflect the reshaped data above
  result.data = data;

  res.json(result);
};

export const groupClassAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;

  const classWhere: Record<string, any> = {};
  if (groupId) classWhere.school = { groupId };

  const {
    totalClasses,
    averageClassSize,
    averagePerformance,
    averageAttendance,
    topClassesByPopulation,
  } = await getClassAnalyticsData(classWhere);

  const classChartItems = topClassesByPopulation.map((classItem) => ({
    label: classItem.name || classItem.classId,
    value: classItem.population,
  }));
  const chartBorderRadious = 7;
  const studentByClassChart: ChartJsData = toChartData(
    classChartItems,
    'Students',
    chartBorderRadious,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalClasses,
    averageClassSize,
    averagePerformance,
    averageAttendance,
    topClassesByPopulation: {
      chart: studentByClassChart,
    },
    timestamp,
    success: true,
    message: 'class analytics fetched.',
  });
};
