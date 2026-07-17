import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/apiResponse.js';

export const groupAuthorization = (req: Request, res: Response, next: NextFunction) => {
  const groupId = req.params.groupId;
  const isAuthorized = groupId ? groupId === req.groupId : false;
  if (!isAuthorized) {
    const error = new ApiError(401, "You don't have access to this resource");
    return next(error);
  }

  return next();
};
