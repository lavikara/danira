import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { sign, verify } from "../../utils/jwtToken.js";
import { queryUsersTableByEmail } from "../../services/dbServices/usersTable.js";
import { LoginInput } from "../../middleware/zodvalidate/schema/auth/authSchemas.js";
import { SuccessResponse, ApiError } from "../../utils/apiResponse.js";
import { Users } from "../../generated/browser.js";
import { getRelationKey } from "../../utils/helpers.js";
import { queryUserByRoleId } from "../../services/dbServices/usersTable.js";
import { forgotPasswordMail } from "../../services/emailServices/emailService.js";
import { UserQueryOptions } from "../../types/definitions.js";
import { updateUserPassword } from "../../services/dbServices/usersTable.js";

/**
 *    Login logic for all type of users
 */
export const login = async (
  req: Request<LoginInput["body"]>,
  res: Response,
  next: NextFunction,
) => {
  const { email, password } = req.body;
  const omitPassword: boolean = false;

  const user = await queryUsersTableByEmail(email, omitPassword);
  if (!user) {
    const error = new ApiError(404, "Resource Not Found");
    return next(error);
  }

  if (!user.isVerified) {
    const error = new ApiError(
      401,
      "Please verify your email by using the forgot password feature.",
    );
    return next(error);
  }

  const relationKey = getRelationKey(user as Users);
  if (!relationKey) {
    const error = new ApiError(422, "User has no relation");
    return next(error);
  }

  const userRelation = (user as any)[relationKey];

  const validPassword = bcrypt.compareSync(password, (user as any).password);
  if (!validPassword) {
    const error = new ApiError(401, "Unauthorised");
    return next(error);
  }

  //   To-Do: unsign previous token when a new token is generated
  const token = sign({ [relationKey]: userRelation.id });

  res.status(200).send(new SuccessResponse("Access granted", token));
};

/**
 *    Reset password logic for all users
 */
export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { token, newPassword } = req.body;
  const verifiedJwt = verify(token) as Record<string, unknown>;

  const relationKey = getRelationKey(verifiedJwt);

  if (!relationKey) {
    const error = new ApiError(
      422,
      "Invalid token, please use the forgot password route.",
    );
    return next(error);
  }

  const userId = verifiedJwt[relationKey] as string | undefined;
  if (!userId) {
    const error = new ApiError(
      422,
      "Invalid token, please use the forgot password route.",
    );
    return next(error);
  }

  const result = await queryUserByRoleId(relationKey, userId);
  if (!result || !result.user) {
    const error = new ApiError(404, "User not found");
    return next(error);
  }

  const hashedPassword = bcrypt.hashSync(newPassword);
  const queryOptions: UserQueryOptions = {
    omitPassword: true,
  };
  const updated = await updateUserPassword(
    result.user.id,
    hashedPassword,
    queryOptions,
  );
  if (updated) {
    res.status(200).send(new SuccessResponse("Password updated", updated));
  }
};

/**
 *    Forgot password logic for all users
 */
export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { email } = req.body;
  const omitPassword: boolean = false;
  const user = await queryUsersTableByEmail(email, omitPassword);
  if (!user) {
    const error = new ApiError(404, "You don't have an account with us");
    return next(error);
  }

  const relationKey = getRelationKey(user as Users);

  if (!relationKey) {
    const error = new ApiError(422, "User has no relation");
    return next(error);
  }

  const userRelation = (user as any)[relationKey];

  if (userRelation) {
    const token = sign({ [relationKey]: userRelation.id }, 3600);
    const urlData = { token };
    forgotPasswordMail(user as any, urlData);
    return res
      .status(201)
      .send(new SuccessResponse("Reset link sent to email", {}));
  }
  const error = new ApiError(422, "Unprocessable Entity");
  return next(error);
};

/**
 *    Signup logic for all users
 */
export const schoolSignup = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
