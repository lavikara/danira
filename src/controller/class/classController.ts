import { type Request, type Response, type NextFunction } from 'express';
import { getClassAnalyticsData } from '../../services/classService/classAnalyticsService.js';
import { ChartJsData } from '../../types/definitions.js';
import { toChartData } from '../../utils/analytics.js';
import { FeeStructures } from '../../generated/browser.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { PaginatedClassQuery } from '../../services/paginationService/paginate.js';

const CLASSES_SORTABLE_FIELDS = ['population', 'name'] as const;

const resolveSort = createSortWhitelist(CLASSES_SORTABLE_FIELDS, 'name', {
  name: (order) => ({ name: order }),
  population: (order) => ({ population: order }),
});

interface ClassFee {
  id: string;
  feeStructureId: string;
  classId: string;
  createdAt: string;
  feeStructure: FeeStructures;
}

const calculateCompulsoryFees = (structures: ClassFee[]): number => {
  return structures
    .filter((fee) => fee.feeStructure.category === 'COMPULSORY')
    .reduce((total, fee) => total + fee.feeStructure.amount, 0);
};

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
      feeStructures: { include: { feeStructure: true } },
    },
  } satisfies PaginatedClassQuery;

  const result = await paginatedResource('classes', query, 'Fetched all classes');
  if (!result.success) {
    throw new Error('Unable to fetch classes');
  }
  const data = result.data.map(({ feeStructures, subjectOfferings, ...classItem }) => {
    return {
      ...classItem,
      subjectOfferings,
      subjectCount: subjectOfferings.length,
      compulsoryFeesAmount: {
        amount: calculateCompulsoryFees(feeStructures),
        currency: feeStructures[0]?.feeStructure.currency ?? null,
      },
    };
  });

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
      feeStructures: { include: { feeStructure: true } },
    },
  } satisfies PaginatedClassQuery;

  const result = await paginatedResource('classes', query, 'Fetched all classes');

  if (!result.success) {
    throw new Error('Unable to fetch classes');
  }

  const data = result.data.map(({ feeStructures, subjectOfferings, ...classItem }) => {
    return {
      ...classItem,
      subjectOfferings,
      subjectCount: subjectOfferings.length,
      compulsoryFeesAmount: {
        amount: calculateCompulsoryFees(feeStructures),
        currency: feeStructures[0]?.feeStructure.currency ?? null,
      },
    };
  });

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
