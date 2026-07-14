import { type Request, type Response, type NextFunction } from 'express';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { groupDetails } from '../../services/schoolService/groupSchoolService.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { schoolDetails } from '../../services/schoolService/singleSchoolService.js';

const SCHOOLS_SORTABLE_FIELDS = ['email', 'schoolName'] as const;
const resolveSort = createSortWhitelist(SCHOOLS_SORTABLE_FIELDS, 'schoolName');

export const getSingleSchoolDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const schoolId = req.params.schoolId;
  const details = await schoolDetails(schoolId as string);
  if (!details?.success) {
    const error = new ApiError(404, details?.message);
    next(error);
    return;
  }

  if (details?.success) {
    res.status(200).send(new SuccessResponse(details?.message, details?.data));
    return;
  }

  const error = new ApiError(404, 'Schools not found.');
  next(error);
};

export const getGroupDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const groupId = req.params.groupId;

  const details = await groupDetails(groupId as string);
  if (!details?.success) {
    const error = new ApiError(404, details?.message);
    next(error);
    return;
  }

  if (details?.success) {
    res.status(200).send(new SuccessResponse(details?.message, details?.data));
    return;
  }

  const error = new ApiError(404, 'Schools not found.');
  next(error);
};

export const getGroupSchools = async (req: Request, res: Response, next: NextFunction) => {
  const groupId = req.params.groupId;

  const groupschoolDetails = await groupDetails(groupId as string);
  const schoolIds = groupschoolDetails.data?.schoolGroups.admins[0].schoolIds as string[];
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolName, email } = req.query;
  const where: Record<string, any> = {};

  if (schoolIds) where.id = { in: schoolIds };
  if (schoolIds && schoolName) where.schoolName = schoolName;
  if (schoolIds && email) where.schoolName = schoolName;

  if (search) {
    where.OR = [
      { schoolName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  const query = {
    where,
    page,
    limit,
    orderBy: { [resolveSort(sortBy)]: order },
  };

  const details = await paginatedResource('schools', query, 'All group schools fetched');
  if (!details?.success) {
    const error = new ApiError(404, details?.message);
    next(error);
    return;
  }

  if (details?.success) {
    res.json(details);
    return;
  }

  const error = new ApiError(404, 'Schools not found.');
  next(error);
};
