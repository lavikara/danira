import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/apiResponse.js';

export const schoolAuthorization = (req: Request, res: Response, next: NextFunction) => {
  const schoolId = req.params.schoolId;
  const schoolIds = req.schoolIds as string[];
  const isAuthorized = schoolId ? schoolIds.includes(schoolId as string) : false;
  if (!isAuthorized) {
    const error = new ApiError(401, "You don't have access to this resource");
    return next(error);
  }

  return next();
};
