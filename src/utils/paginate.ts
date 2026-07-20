import {
  Paginatable,
  PaginatedResult,
  PaginatedStudentQuery,
  StudentQuery,
  StaffQuery,
  PaginatedStudentResult,
  PaginatedStaffResult,
  PaginatedStaffQuery,
} from '../types/definitions.js';

/**
 * Generic offset-based pagination for any Prisma model delegate
 * (prisma.schools, prisma.students, prisma.staffs, etc).
 *
 * Runs findMany + count in parallel inside a single call so callers
 * never have to hand-roll skip/take/Promise.all logic per route.
 */
export async function paginate<T extends StudentQuery & StaffQuery>(
  delegate: Paginatable,
  {
    where = {},
    orderBy,
    select,
    include,
    page,
    limit,
  }: PaginatedStudentQuery & PaginatedStaffQuery,
  message: string,
): Promise<PaginatedStudentResult<T> & PaginatedStaffResult<T>> {
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
