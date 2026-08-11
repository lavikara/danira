import { type Request, type Response, type NextFunction } from 'express';
import { Duration, FeeStatus, FeeCategory } from '../../generated/browser.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { PaginatedFeeStructureQuery } from '../../services/paginationService/paginate.js';
import { matchEnumValue } from '../../utils/helpers.js';
import {
  getFeeStructureCounts,
  getStudentsPerFeeTypeChart,
} from '../../services/feeService/feeAnalyticsService.js';

const FEE_SORTABLE_FIELDS = ['name', 'category', 'amount', 'classType', 'createdAt'] as const;

const resolveFeeSort = createSortWhitelist(FEE_SORTABLE_FIELDS, 'name', {
  name: (order) => ({ name: order }),
  category: (order) => ({ category: order }),
  amount: (order) => ({ amount: order }),
  classType: (order) => ({ classType: order }),
  createdAt: (order) => ({ createdAt: order }),
});

function buildStudentNameFilter(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return undefined;

  return {
    users: {
      AND: words.map((word) => ({
        OR: [
          { firstName: { contains: word, mode: 'insensitive' as const } },
          { lastName: { contains: word, mode: 'insensitive' as const } },
        ],
      })),
    },
  };
}

function buildFeeWhere(query: Request['query']) {
  const {
    studentId,
    studentName,
    classInfo,
    termStatus,
    invoiceStatus,
    search,
    schoolName,
    feeStructureName,
    category,
  } = query;
  const where: Record<string, any> = {};

  const feeRelationConditions: Record<string, any> = {};

  if (studentId) feeRelationConditions.studentId = studentId as string;

  if (classInfo) {
    feeRelationConditions.classInfo = {
      name: { equals: classInfo as string, mode: 'insensitive' as const },
    };
  }

  if (studentName) {
    const filter = buildStudentNameFilter(studentName as string);
    if (filter) feeRelationConditions.student = filter;
  }

  if (termStatus) {
    const status = matchEnumValue(Duration, termStatus as string);
    if (status) feeRelationConditions.term = { status };
  }

  if (invoiceStatus) {
    const status = matchEnumValue(FeeStatus, invoiceStatus as string);
    if (status) feeRelationConditions.status = status;
  }

  if (Object.keys(feeRelationConditions).length) {
    where.fees = { some: feeRelationConditions };
  }

  if (schoolName) {
    where.school = {
      schoolName: { contains: schoolName as string, mode: 'insensitive' as const },
    };
  }

  if (feeStructureName) {
    where.name = { contains: feeStructureName as string, mode: 'insensitive' as const };
  }

  if (category) {
    const matchedCategory = matchEnumValue(FeeCategory, category as string);
    if (matchedCategory) where.category = matchedCategory;
  }

  if (search) {
    const term = search as string;
    const searchConditions: Record<string, any>[] = [
      { name: { contains: term, mode: 'insensitive' as const } },
      { description: { contains: term, mode: 'insensitive' as const } },
      {
        fees: {
          some: { invoice: { invoiceNumber: { contains: term, mode: 'insensitive' as const } } },
        },
      },
      { fees: { some: { studentId: { equals: term } } } },
      { fees: { some: { term: { name: { contains: term, mode: 'insensitive' as const } } } } },
      {
        fees: {
          some: {
            student: {
              users: {
                OR: [
                  { firstName: { contains: term, mode: 'insensitive' as const } },
                  { lastName: { contains: term, mode: 'insensitive' as const } },
                ],
              },
            },
          },
        },
      },
      { school: { schoolName: { contains: term, mode: 'insensitive' as const } } },
    ];

    const matchedTermStatus = matchEnumValue(Duration, term);
    if (matchedTermStatus) {
      searchConditions.push({ fees: { some: { term: { status: matchedTermStatus } } } });
    }

    const matchedInvoiceStatus = matchEnumValue(FeeStatus, term);
    if (matchedInvoiceStatus) {
      searchConditions.push({ fees: { some: { status: matchedInvoiceStatus } } });
    }

    const matchedCategory = matchEnumValue(FeeCategory, term);
    if (matchedCategory) {
      searchConditions.push({ category: matchedCategory });
    }

    where.OR = searchConditions;
  }

  return where;
}

export const allSingleSchoolFees = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order } = req.pagination;

  const where = buildFeeWhere(req.query);
  if (schoolId) where.schoolId = schoolId;

  const query = {
    where,
    page,
    limit,
    orderBy: resolveFeeSort(sortBy, order),
    include: {
      fees: {
        include: {
          term: true,
          student: { include: { users: { select: { firstName: true, lastName: true } } } },
        },
      },
      school: {
        select: {
          schoolName: true,
        },
      },
    },
  } satisfies PaginatedFeeStructureQuery;

  const result = await paginatedResource('feeStructures', query, 'Fetched all fee structures');
  if (!result.success) throw new Error('Unable to fetch fee structures');
  res.json(result);
};

export const allGroupSchoolFees = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order } = req.pagination;
  const { schoolId } = req.query;

  const where = buildFeeWhere(req.query);
  where.school = { groupId };
  if (schoolId) where.schoolId = schoolId as string;

  const query = {
    where,
    page,
    limit,
    orderBy: resolveFeeSort(sortBy, order),
    include: {
      fees: {
        include: {
          term: true,
          student: { include: { users: { select: { firstName: true, lastName: true } } } },
        },
      },
      school: {
        select: {
          schoolName: true,
        },
      },
    },
  } satisfies PaginatedFeeStructureQuery;

  const result = await paginatedResource('feeStructures', query, 'Fetched all fee structures');
  if (!result.success) throw new Error('Unable to fetch fee structures');
  res.json(result);
};

export const singleSchoolFeeAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const feeScopeWhere = { schoolId };

  const [counts, studentsPerFeeTypeChart] = await Promise.all([
    getFeeStructureCounts(feeScopeWhere),
    getStudentsPerFeeTypeChart(feeScopeWhere),
  ]);
  const timestamp = new Date().toISOString();

  res.json({
    success: true,
    timestamp,
    message: 'Fee analytics fetched.',
    data: { ...counts, studentsPerFeeTypeChart },
  });
};

export const groupFeeAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const feeScopeWhere = { school: { groupId } };

  const [counts, studentsPerFeeTypeChart] = await Promise.all([
    getFeeStructureCounts(feeScopeWhere),
    getStudentsPerFeeTypeChart(feeScopeWhere),
  ]);
  const timestamp = new Date().toISOString();

  res.json({
    success: true,
    timestamp,
    message: 'Fee analytics fetched.',
    data: { ...counts, studentsPerFeeTypeChart },
  });
};
