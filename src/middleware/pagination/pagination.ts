import { Request, Response, NextFunction } from 'express';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

/**
 * Parses ?page, ?limit, ?sortBy, ?order, ?search from the query string,
 * validates/clamps them, and attaches the result to req.pagination.
 *
 * Does NOT know about any specific model — the allowed sort fields are
 * validated later, per-route, via createSortWhitelist().
 */
export function pagination(req: Request, res: Response, next: NextFunction) {
  const rawPage = Number(req.query.page);
  const rawLimit = Number(req.query.limit);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;

  const limit =
    Number.isInteger(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, MAX_LIMIT) : DEFAULT_LIMIT;

  const order = req.query.order === 'asc' ? 'asc' : 'desc';

  const sortBy =
    typeof req.query.sortBy === 'string' && req.query.sortBy.trim() !== ''
      ? req.query.sortBy.trim()
      : undefined;

  const search =
    typeof req.query.search === 'string' && req.query.search.trim() !== ''
      ? req.query.search.trim()
      : undefined;

  req.pagination = {
    page,
    limit,
    skip: (page - 1) * limit,
    sortBy,
    order,
    search,
  };

  next();
}

/**
 * Returns a small helper that validates a requested `sortBy` field against
 * an allow-list for a specific model, falling back to a safe default.
 * This prevents arbitrary/unknown columns from being passed into orderBy.
 */
export function createSortWhitelist<T extends string>(
  allowedFields: readonly T[],
  defaultField: T,
) {
  return (requested?: string): T => {
    if (requested && (allowedFields as readonly string[]).includes(requested)) {
      return requested as T;
    }
    return defaultField;
  };
}
