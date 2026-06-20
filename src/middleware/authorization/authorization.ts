import { Request, Response, NextFunction } from "express";
import { verify } from "../../services/jwtService/jwtService.js";
import { Role } from "../../generated/browser.js";
import { queryUserByRoleId } from "../../services/dbServices/usersTable.js";

import { SuccessResponse, ApiError } from "../../utils/apiResponse.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authJwtAndRole = (authorizedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const error = new ApiError(401, "Unauthorised");
      return next(error);
    }
    const token = authHeader.split(" ")[1];
    const verifiedJwt = verify(token) as Record<string, unknown>;
    const key: string | undefined = Object.keys(verifiedJwt)[0];
    const userId = verifiedJwt[key as string] as string;
    req.userId = userId;
    let user = await queryUserByRoleId(key as string, userId);

    const userRole = user?.user.role;

    const isAuthorized = userRole ? authorizedRoles.includes(userRole) : false;
    if (isAuthorized) return next();

    const error = new ApiError(401, "Unauthorised");
    return next(error);
  };
};
