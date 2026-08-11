import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/apiResponse.js';

export const staffAuthorization = (req: Request, res: Response, next: NextFunction) => {
  const staffId = req.params.staffId;
  const userId = req.userId as string;
  const isAuthorized = staffId === userId ? true : false;
  if (!isAuthorized) {
    const error = new ApiError(401, "You don't have access to this resource");
    return next(error);
  }

  return next();
};
