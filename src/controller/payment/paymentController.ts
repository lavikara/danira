import { type Request, type Response, type NextFunction } from 'express';
import { getClassAnalyticsData } from '../../services/classService/classAnalyticsService.js';
import { ChartJsData } from '../../types/definitions.js';
import { toChartData } from '../../utils/analytics.js';
import { Duration, FeeStatus, FeeCategory } from '../../generated/browser.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { matchEnumValue } from '../../utils/helpers.js';
import {
  getPaymentAnalyticsData,
  getPaymentTypeRevenueChartData,
  getMonthlyRevenueChartData,
} from '../../services/paymentService/paymentAnalyticsService.js';
import {
  PaginatedFeeStructureQuery,
  PaginatedFeeInvoiceQuery,
} from '../../services/paginationService/paginate.js';

const PAYMENT_RECORD_SORTABLE_FIELDS = ['classInfo', 'student', 'status', 'term'] as const;

const resolvePaymentRecordSort = createSortWhitelist(PAYMENT_RECORD_SORTABLE_FIELDS, 'student', {
  student: (order) => ({ student: { users: { lastName: order } } }),
  classInfo: (order) => ({ classInfo: { name: order } }),
  status: (order) => ({ status: order }),
  term: (order) => ({ term: { name: order } }),
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

function buildPaymentRecordWhere(query: Request['query']) {
  const { studentId, studentName, classInfo, termStatus, invoiceStatus, search } = query;
  const where: Record<string, any> = {};

  if (studentId) where.studentId = studentId as string;
  if (classInfo) where.classInfo = { name: classInfo as string };

  if (studentName) {
    const filter = buildStudentNameFilter(studentName as string);
    if (filter) where.student = filter;
  }

  if (termStatus) {
    const status = matchEnumValue(Duration, termStatus as string);
    if (status) where.term = { status };
  }

  if (invoiceStatus) {
    const status = matchEnumValue(FeeStatus, invoiceStatus as string);
    if (status) where.status = status;
  }

  if (search) {
    const term = search as string;
    const searchConditions: Record<string, any>[] = [
      { invoiceNumber: { contains: term, mode: 'insensitive' as const } },
      { term: { name: { contains: term, mode: 'insensitive' as const } } },
      {
        student: {
          users: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' as const } },
              { lastName: { contains: term, mode: 'insensitive' as const } },
            ],
          },
        },
      },
    ];

    const matchedTermStatus = matchEnumValue(Duration, term);
    if (matchedTermStatus) {
      searchConditions.push({
        term: {
          status: matchedTermStatus,
        },
      });
    }

    const matchedInvoiceStatus = matchEnumValue(FeeStatus, term);
    if (matchedInvoiceStatus) {
      searchConditions.push({
        status: matchedInvoiceStatus,
      });
    }

    where.OR = searchConditions;
  }

  return where;
}

export const allSingleSchoolPaymentRecords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order } = req.pagination;

  const where = buildPaymentRecordWhere(req.query);
  if (schoolId) where.schoolId = schoolId;

  const query = {
    where,
    page,
    limit,
    orderBy: resolvePaymentRecordSort(sortBy, order),
    include: {
      term: true,
      fees: true,
      student: { include: { users: true } },
    },
  } satisfies PaginatedFeeInvoiceQuery;

  const result = await paginatedResource('feeInvoice', query, 'Fetched all invoice');
  if (!result.success) throw new Error('Unable to fetch invoice');
  res.json(result);
};

export const allGroupSchoolPaymentRecords = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order } = req.pagination;
  const { schoolId } = req.query;

  const where = buildPaymentRecordWhere(req.query);
  where.school = { groupId };
  if (schoolId) where.schoolId = schoolId as string;

  const query = {
    where,
    page,
    limit,
    orderBy: resolvePaymentRecordSort(sortBy, order),
    include: {
      term: true,
      fees: true,
      student: { include: { users: true } },
    },
  } satisfies PaginatedFeeInvoiceQuery;

  const result = await paginatedResource('feeInvoice', query, 'Fetched all invoice');
  if (!result.success) throw new Error('Unable to fetch invoice');
  res.json(result);
};

export const singleSchoolPaymentAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const scopeWhere = { schoolId };

  const [analytics, feeTypeChart, monthlyChart] = await Promise.all([
    getPaymentAnalyticsData(scopeWhere, year),
    getPaymentTypeRevenueChartData(scopeWhere, year),
    getMonthlyRevenueChartData(scopeWhere, year),
  ]);
  const timestamp = new Date().toISOString();

  res.json({
    success: true,
    timestamp,
    message: 'Fee analytics fetched.',
    data: { ...analytics, feeTypeChart, monthlyChart },
  });
};

export const groupPaymentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const scopeWhere = { school: { groupId } };

  const [analytics, feeTypeChart, monthlyChart] = await Promise.all([
    getPaymentAnalyticsData(scopeWhere, year),
    getPaymentTypeRevenueChartData(scopeWhere, year),
    getMonthlyRevenueChartData(scopeWhere, year),
  ]);
  const timestamp = new Date().toISOString();

  res.json({
    success: true,
    timestamp,
    message: 'Fee analytics fetched.',
    data: { ...analytics, feeTypeChart, monthlyChart },
  });
};
