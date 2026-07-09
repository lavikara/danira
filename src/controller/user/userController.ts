import { type Request, type Response, type NextFunction } from 'express';
import { verify } from '../../services/jwtService/jwtService.js';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { findUniqueUser } from '../../services/dbServices/dbServices.js';
import { RelationKeys } from '../../types/definitions.js';

export const loggedInUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  const verifiedJwt = (await verify(token)) as Record<string, unknown>;
  if (!verifiedJwt) {
    const error = new ApiError(422, 'Unprocessable Token');
    return next(error);
  }
  const relationKeys: RelationKeys[] = ['admins', 'students', 'staffs', 'guardians'];
  // Find which relation key exists on the verified JWT and attach it to res.locals.user
  const foundKey = relationKeys.find(
    (key) =>
      Object.prototype.hasOwnProperty.call(verifiedJwt, key) &&
      (verifiedJwt as Record<string, unknown>)[key],
  );
  if (!foundKey) {
    const error = new ApiError(404, 'User relation not found in token');
    return next(error);
  }

  const user: RelationKeys | unknown = (verifiedJwt as Record<string, unknown>)[foundKey];
  const userQuery = await findUniqueUser(foundKey, 'id', user as string, {
    users: true,
  });

  if (userQuery) {
    delete (userQuery as any)[foundKey]?.users?.password;
    res.status(200).send(new SuccessResponse('User found', userQuery));
  }

  throw new Error('Internal logic error');
};
