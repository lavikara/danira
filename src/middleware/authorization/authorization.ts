import { Request, Response, NextFunction } from 'express';
import { verify } from '../../services/jwtService/jwtService.js';
import { Role } from '../../generated/browser.js';
import { RelationKeys } from '../../types/definitions.js';
import { getRelationKey } from '../../utils/helpers.js';
import { findUniqueUser } from '../../services/dbServices/dbServices.js';
import { ApiError } from '../../utils/apiResponse.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userKey?: RelationKeys;
      userRole?: string;
    }
  }
}

export const authJwtAndRole = (authorizedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new ApiError(401, 'Unauthorised');
      return next(error);
    }
    const token = authHeader.split(' ')[1];
    const verifiedJwt = (await verify(token)) as Record<string, unknown>;
    const relationKey: RelationKeys | undefined = getRelationKey(verifiedJwt);

    if (!relationKey) {
      const error = new ApiError(401, 'Unauthorised');
      return next(error);
    }

    const userId = verifiedJwt[relationKey] as string | undefined;

    if (!userId) {
      const error = new ApiError(401, 'Unauthorised');
      return next(error);
    }

    req.userId = userId;
    req.userKey = relationKey;

    const query = {
      table: relationKey,
      where: 'id',
      whereValue: userId,
      include: { users: true },
    } as const;

    let user = await findUniqueUser(query.table, query.where, query.whereValue, query.include);

    if (!user) {
      const error = new ApiError(401, 'Unauthorised');
      return next(error);
    }
    const userObj = (user as any)[relationKey];
    const userRole = userObj.users.role;
    req.userRole = userRole;

    const isAuthorized = userRole ? authorizedRoles.includes(userRole) : false;
    if (isAuthorized) return next();

    const error = new ApiError(401, 'Unauthorised');
    return next(error);
  };
};
