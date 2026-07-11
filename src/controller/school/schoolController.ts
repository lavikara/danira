import { type Request, type Response, type NextFunction } from 'express';
import { verify } from '../../services/jwtService/jwtService.js';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { findUniqueUser, findUniqueSchool } from '../../services/dbServices/dbServices.js';
import { groupSchools, groupDetails } from '../../services/schoolService/group.js';
import { schoolDetails } from '../../services/schoolService/singleSchool.js';
import { RelationKeys } from '../../types/definitions.js';

export const getSingleSchoolDetails = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userKey = req.userKey;
  const userId = req.userId;
  const userQuery = await findUniqueUser(userKey as RelationKeys, 'id', userId as string, {
    users: true,
  });

  const permission = [
    'GROUPSCHOOLADMIN',
    'SCHOOLADMIN',
    'SUBSCHOOLADMIN',
    'SCHOOLSTAFF',
    'STUDENT',
  ];
  if (!permission.includes(userQuery?.admins.users?.role as string)) {
    const error = new ApiError(401, 'Unauthorised');
    next(error);
    return;
  }
  const schoolId = userQuery?.admins.schoolIds as [];

  const details = await schoolDetails(schoolId);
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
  const userKey = req.userKey;
  const userId = req.userId;
  const userQuery = await findUniqueUser(userKey as RelationKeys, 'id', userId as string, {
    users: true,
  });
  if (userQuery?.admins.users?.role !== 'GROUPSCHOOLADMIN') {
    const error = new ApiError(401, 'Unauthorised');
    next(error);
    return;
  }
  const groupId = userQuery.admins.groupId;

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
  const userKey = req.userKey;
  const userId = req.userId;
  const userQuery = await findUniqueUser(userKey as RelationKeys, 'id', userId as string, {
    users: true,
  });
  if (userQuery?.admins.users?.role !== 'GROUPSCHOOLADMIN') {
    const error = new ApiError(401, 'Unauthorised');
    next(error);
    return;
  }
  const schoolIds = userQuery?.admins.schoolIds as [];
  const details = await groupSchools(schoolIds);
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
