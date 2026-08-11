import { Prisma } from '../../generated/client.js';
import { PaginatedResult } from '../../types/definitions.js';

export type PaginatableDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: { where?: any }) => Promise<number>;
};

export type FindManyArgs<D extends PaginatableDelegate> = Parameters<D['findMany']>[0];

type FindManyResult<D extends PaginatableDelegate> = Awaited<ReturnType<D['findMany']>>[number];

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string | undefined;
  order: 'asc' | 'desc';
  search?: string | undefined;
}

export interface PageQuery {
  page: number;
  limit: number;
}

export type StudentQuery = Prisma.StudentsFindManyArgs;

export type ClassQuery = Prisma.ClassesFindManyArgs;

export type StaffQuery = Prisma.StaffsFindManyArgs;

export type SubjectQuery = Prisma.SubjectsFindManyArgs;

export type TimetableQuery = Prisma.TimetablesFindManyArgs;

export type StaffAttendanceQuery = Prisma.StaffAttendanceFindManyArgs;

export type StudentAttendanceQuery = Prisma.StudentAttendanceFindManyArgs;

export type NotificationQuery = Prisma.NotificationsFindManyArgs;

export type FeeStructuresQuery = Prisma.FeeStructuresFindManyArgs;

export type FeeInvoiceQuery = Prisma.FeeInvoiceFindManyArgs;

export type MatronQuery = Prisma.BoardingHouseMatronsFindManyArgs;

export type PaginatedQuery<T> = T & PageQuery;

export type PaginatedStudentQuery = PaginatedQuery<StudentQuery>;

export type PaginatedClassQuery = PaginatedQuery<ClassQuery>;

export type PaginatedStaffQuery = PaginatedQuery<StaffQuery>;

export type PaginatedSubjectQuery = PaginatedQuery<SubjectQuery>;

export type PaginatedTimetableQuery = PaginatedQuery<TimetableQuery>;

export type PaginatedStaffAttendanceQuery = PaginatedQuery<StaffAttendanceQuery>;

export type PaginatedStudentAttendanceQuery = PaginatedQuery<StudentAttendanceQuery>;

export type PaginatedNotificationQuery = PaginatedQuery<NotificationQuery>;

export type PaginatedFeeStructureQuery = PaginatedQuery<FeeStructuresQuery>;

export type PaginatedFeeInvoiceQuery = PaginatedQuery<FeeInvoiceQuery>;

export type PaginatedMatronQuery = PaginatedQuery<MatronQuery>;

export async function paginate<D extends PaginatableDelegate>(
  delegate: D,
  args: Pick<FindManyArgs<D>, 'where' | 'orderBy' | 'select' | 'include'> & {
    page: number;
    limit: number;
  },
  message: string,
): Promise<PaginatedResult<FindManyResult<D>>> {
  const { where = {}, orderBy, select, include, page, limit } = args;
  const skip = (page - 1) * limit;

  const findArgs: Record<string, any> = {
    where,
    skip,
    take: limit,
  };
  if (orderBy) findArgs.orderBy = orderBy;
  if (select) {
    findArgs.select = select;
  } else if (include) {
    findArgs.include = include;
  }

  const [data, total] = await Promise.all([delegate.findMany(findArgs), delegate.count({ where })]);

  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  const timestamp = new Date().toISOString();

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    timestamp,
    success: true,
    message,
  };
}
