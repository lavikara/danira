import { type Request, type Response, type NextFunction } from 'express';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { findUniqueUser } from '../../services/dbServices/dbServices.js';
import { RelationKeys } from '../../types/definitions.js';

export const loggedInUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userKey = req.userKey;
  const userId = req.userId;
  if (!userKey || !userId) {
    const error = new ApiError(401, 'Unauthorised');
    return next(error);
  }
  const userQuery = await findUniqueUser(userKey as RelationKeys, 'id', userId as string, {
    users: true,
  });

  if (userQuery) {
    delete (userQuery as any)[userKey]?.users?.password;
    res.status(200).send(new SuccessResponse('User found', userQuery));
    return;
  }

  const error = new ApiError(404, 'User not found');
  return next(error);
};
