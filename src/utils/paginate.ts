import { Prisma } from '../generated/client.js';
import { PaginatedResult } from '../types/definitions.js';

export type PaginatableDelegate = {
  findMany: (args: any) => Promise<any[]>;
  count: (args: { where?: any }) => Promise<number>;
};

// Pulls the exact findMany args type Prisma generated for this specific delegate
// (its own WhereInput, OrderBy, Select, Include — no manual union needed).
export type FindManyArgs<D extends PaginatableDelegate> = Parameters<D['findMany']>[0];

// Infers the exact result row shape based on whatever select/include the
// caller passed for THIS call — same way Prisma's own client does it.
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

export type PaginatedQuery<T> = T & PageQuery;

export type PaginatedStudentQuery = PaginatedQuery<StudentQuery>;

export type PaginatedClassQuery = PaginatedQuery<ClassQuery>;

export type PaginatedStaffQuery = PaginatedQuery<StaffQuery>;

export type PaginatedSubjectQuery = PaginatedQuery<SubjectQuery>;

export type PaginatedTimetableQuery = PaginatedQuery<TimetableQuery>;

/**
 * Generic offset-based pagination for any Prisma model delegate
 * (prisma.schools, prisma.students, prisma.staffs, etc).
 *
 * Runs findMany + count in parallel inside a single call so callers
 * never have to hand-roll skip/take/Promise.all logic per route.
 */
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
  // select and include are mutually exclusive in Prisma — only pass one.
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
