import { PaginateOptions, Paginatable, PaginatedResult } from '../types/definitions.js';

/**
 * Generic offset-based pagination for any Prisma model delegate
 * (prisma.schools, prisma.students, prisma.staffs, etc).
 *
 * Runs findMany + count in parallel inside a single call so callers
 * never have to hand-roll skip/take/Promise.all logic per route.
 */
export async function paginate<T>(
  delegate: Paginatable<T>,
  { where = {}, orderBy, select, include, page, limit }: PaginateOptions,
  message: string,
): Promise<PaginatedResult<T>> {
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
