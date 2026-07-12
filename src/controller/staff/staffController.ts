import { type Request, type Response, type NextFunction } from 'express';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';

const STAFFS_SORTABLE_FIELDS = ['employmentStatus', 'position'] as const;
const resolveSort = createSortWhitelist(STAFFS_SORTABLE_FIELDS, 'position');

export const allStaffs = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, departmentId, employmentStatus, accomodation } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (departmentId) where.departmentId = departmentId;
  if (employmentStatus) where.employmentStatus = employmentStatus;
  if (accomodation) where.accomodation = accomodation;

  if (search) {
    where.OR = [
      { position: { contains: search, mode: 'insensitive' } },
      {
        users: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: { [resolveSort(sortBy)]: order },
    include: {
      users: { omit: { password: true } },
      school: true,
      department: true,
      headOfDepartment: true,
    },
  };

  const result = await paginatedResource('staffs', query, 'Fetched all staffs');

  if (!result.success) {
    throw new Error('Unable to fetch staffs');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};
