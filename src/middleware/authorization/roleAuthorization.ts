import { Request, Response, NextFunction } from 'express';
import { Role } from '../../generated/browser.js';
import { ApiError } from '../../utils/apiResponse.js';

export const roleAuthorization = (authorizedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.userRole;
    const isAuthorized = userRole ? authorizedRoles.includes(userRole as Role) : false;
    if (isAuthorized) return next();

    const error = new ApiError(401, 'Unauthorised');
    return next(error);
  };
};
