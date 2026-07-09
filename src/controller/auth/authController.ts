import { type Request, type Response, type NextFunction } from 'express';
import { hash, compare } from '../../services/bcryptService/bcryptService.js';
import { sign, verify } from '../../services/jwtService/jwtService.js';
import { SignupSchoolInput } from '../../middleware/zodvalidate/schema/school/schoolSchemas.js';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { Users } from '../../generated/browser.js';
import { getRelationKey } from '../../utils/helpers.js';
import { forgotPasswordMail } from '../../services/emailServices/emailService.js';
import { updateUserPassword } from '../../services/dbServices/usersTable.js';
import { findUniqueUser } from '../../services/dbServices/dbServices.js';
import { RelationKeys, ReturnResponse } from '../../types/definitions.js';
import { schoolCreatedBySignupMail } from '../../services/emailServices/emailService.js';
import { userSchoolSignup } from '../../services/schoolService/createSchool.js';
import {
  LoginInput,
  ResetPasswordInput,
  ForgotPasswordInput,
} from '../../middleware/zodvalidate/schema/auth/authSchemas.js';

/**
 *    Login logic for all type of users
 */
export const login = async (
  req: Request<LoginInput['body']>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email, password } = req.body;
  const query = {
    table: 'users',
    where: 'email',
    whereValue: email,
    include: { admins: true, students: true, staffs: true, guardians: true },
    omit: { password: false },
  } as const;
  const userQuery = await findUniqueUser(
    query.table,
    query.where,
    query.whereValue,
    query.include,
    query.omit,
  );
  if (!userQuery) {
    const error = new ApiError(404, 'Resource Not Found');
    return next(error);
  }

  if (!userQuery[query.table].isVerified) {
    const error = new ApiError(
      400,
      'Please verify your email by using the forgot password feature.',
    );
    return next(error);
  }

  const relationKey: RelationKeys | undefined = getRelationKey(userQuery[query.table] as Users);

  if (!relationKey) {
    const error = new ApiError(422, 'User has no relation');
    return next(error);
  }

  const userRelation = (userQuery[query.table] as any)[relationKey];

  const validPassword = await compare(password, (userQuery[query.table] as any).password);
  if (!validPassword) {
    const error = new ApiError(400, 'Unauthorised');
    return next(error);
  }
  if (validPassword) {
    //   To-Do: unsign previous token when a new token is generated
    const token = await sign({ [relationKey]: userRelation.id });
    const userObj = { ...userQuery[query.table] };
    delete (userObj as Partial<Users>).password;
    res.status(200).send(new SuccessResponse('Access granted', { token, user: userObj }));
    return;
  }

  throw new Error('Internal logic error');
};

/**
 *    Reset password logic for all users
 */
export const resetPassword = async (
  req: Request<ResetPasswordInput['body']>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { token, newPassword } = req.body;
  const verifiedJwt = (await verify(token)) as Record<string, unknown>;
  if (!verifiedJwt) {
    const error = new ApiError(422, 'Unprocessable Token');
    return next(error);
  }
  const relationKey: RelationKeys | undefined = getRelationKey(verifiedJwt);
  if (!relationKey) {
    const error = new ApiError(422, 'Invalid token, please use the forgot password route.');
    return next(error);
  }

  const userId = verifiedJwt[relationKey] as string | undefined;
  if (!userId) {
    const error = new ApiError(422, 'Invalid token, please use the forgot password route.');
    return next(error);
  }

  const query = {
    table: relationKey,
    where: 'id',
    whereValue: userId,
    include: { users: true },
  } as const;
  const userQuery = await findUniqueUser(query.table, query.where, query.whereValue, query.include);
  if (!userQuery) {
    const error = new ApiError(404, 'User not found');
    return next(error);
  }

  const hashedPassword = await hash(newPassword);

  const updated = await updateUserPassword(userQuery, hashedPassword, relationKey);
  if (updated) {
    res.status(200).send(new SuccessResponse('Password updated', updated));
    return;
  }
  throw new Error('Internal logic error');
};

/**
 *    Forgot password logic for all users
 */
export const forgotPassword = async (
  req: Request<ForgotPasswordInput['body']>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { email } = req.body;
  const query = {
    table: 'users',
    where: 'email',
    whereValue: email,
    include: { admins: true, students: true, staffs: true, guardians: true },
    omit: { password: true },
  } as const;
  const userQuery = await findUniqueUser(
    query.table,
    query.where,
    query.whereValue,
    query.include,
    query.omit,
  );
  if (!userQuery) {
    const error = new ApiError(404, "You don't have an account with us");
    return next(error);
  }

  const relationKey: RelationKeys | undefined = getRelationKey(userQuery[query.table] as Users);

  if (!relationKey) {
    const error = new ApiError(422, 'User has no relation');
    return next(error);
  }

  const userRelation = (userQuery[query.table] as any)[relationKey];
  if (userRelation) {
    const token = await sign({ [relationKey]: userRelation.id }, 3600);
    const urlData = { token };
    forgotPasswordMail(userQuery[query.table] as any, urlData);
    res.status(200).send(new SuccessResponse('Reset link sent to email', {}));
    return;
  }
  throw new Error('Internal logic error');
};

/**
 *    Signup logic for schools
 */
export const schoolSignup = async (
  req: Request<SignupSchoolInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  req.body.schoolData.isApproved = false;
  req.body.schoolData.status = 'PENDING';
  req.body.adminData.status = 'PENDING';
  req.body.adminData.isVerified = false;
  if (req.body.schoolData.setup === 'SINGLE') {
    req.body.adminData.role = 'SCHOOLADMIN';
    req.body.groupData.status = null;
  } else {
    req.body.adminData.role = 'GROUPSCHOOLADMIN';
    req.body.groupData.status = 'PENDING';
  }
  const signupSchool: ReturnResponse = await userSchoolSignup(req.body, req?.userId, req?.userRole);
  if (!signupSchool?.success) {
    const error = new ApiError(409, signupSchool?.message);
    next(error);
    return;
  }

  if (signupSchool?.success) {
    schoolCreatedBySignupMail(req.body);
    res.status(201).send(new SuccessResponse(signupSchool?.message, signupSchool?.data.school));
    return;
  }

  const error = new ApiError(422, 'Unprocessable Entity');
  next(error);
};
