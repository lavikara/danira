import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { toChartData, toMultiSeriesChartData } from '../../utils/analytics.js';
import { Prisma, AttendanceStatus } from '../../generated/client.js';
import { ChartJsData } from '../../types/definitions.js';

export interface FeeAnalyticsResult {
  totalCollected: number;
  totalOutstanding: number;
  debtors: number;
  fullyPaidStudents: number;
  collectionRate: number;
  totalExpected: number;
  currency: string;
}

function yearRange(year: number) {
  return {
    gte: new Date(Date.UTC(year, 0, 1)),
    lt: new Date(Date.UTC(year + 1, 0, 1)),
  };
}

export async function getPaymentAnalyticsData(
  scopeWhere: Record<string, any>,
  year: number = new Date().getFullYear(),
): Promise<FeeAnalyticsResult> {
  const invoiceWhere = { ...scopeWhere, createdAt: yearRange(year) };

  const [totals, debtorGroups, fullyPaidInvoices, sampleInvoice] = await Promise.all([
    prismaClient.feeInvoice.aggregate({
      where: invoiceWhere,
      _sum: { totalPaid: true, totalOutstanding: true, totalAmount: true },
    }),
    prismaClient.feeInvoice.groupBy({
      by: ['studentId'],
      where: { ...invoiceWhere, status: { in: ['UNPAID', 'PARTIAL'] } },
    }),
    prismaClient.feeInvoice.groupBy({
      by: ['studentId'],
      where: {
        ...invoiceWhere,
        status: 'PAID',
        totalOutstanding: 0,
        term: { status: 'ONGOING' },
      },
    }),
    prismaClient.feeInvoice.findFirst({
      where: invoiceWhere,
      select: { currency: true },
    }),
  ]);

  const totalCollected = totals._sum.totalPaid ?? 0;
  const totalOutstanding = totals._sum.totalOutstanding ?? 0;
  const totalExpected = totals._sum.totalAmount ?? 0;
  const debtors = debtorGroups.length;
  const fullyPaidStudents = fullyPaidInvoices.length;
  const collectionRate = totalExpected > 0 ? totalCollected / totalExpected : 0;
  const currency = sampleInvoice?.currency ?? '';

  return {
    totalCollected,
    totalOutstanding,
    debtors,
    fullyPaidStudents,
    collectionRate,
    totalExpected,
    currency,
  };
}

export async function getPaymentTypeRevenueChartData(
  scopeWhere: Record<string, any>,
  year: number = new Date().getFullYear(),
) {
  const revenueArgs = {
    by: ['name'],
    where: { ...scopeWhere, createdAt: yearRange(year) },
    _sum: { paid: true, amount: true },
    orderBy: { name: 'asc' },
  } satisfies Prisma.FeesGroupByArgs;

  const grouped = await prismaClient.fees.groupBy(revenueArgs);

  const labels = grouped.map((g) => g.name);
  const collected = grouped.map((g) => g._sum.paid ?? 0);
  const expected = grouped.map((g) => g._sum.amount ?? 0);

  return {
    chart: toMultiSeriesChartData(labels, [
      { label: 'Revenue Collected', data: collected, color: '#10B981', fill: true },
      { label: 'Expected Revenue', data: expected, color: '#2563EB', fill: true },
    ]),
  };
}

export async function getMonthlyRevenueChartData(
  scopeWhere: Record<string, any>,
  year: number = new Date().getFullYear(),
) {
  const invoices = await prismaClient.feeInvoice.findMany({
    where: { ...scopeWhere, createdAt: yearRange(year) },
    select: { createdAt: true, totalPaid: true },
  });

  const monthlyTotals = new Array(12).fill(0);
  for (const invoice of invoices) {
    monthlyTotals[invoice.createdAt.getUTCMonth()] += invoice.totalPaid;
  }

  const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return {
    chart: toChartData(
      MONTH_LABELS.map((label, i) => ({ label, value: monthlyTotals[i] })),
      'Revenue',
      7,
    ),
  };
}
