import { type Request, type Response, type NextFunction } from "express";
import bcrypt from "bcryptjs";
import { SignupSingleSchoolInput } from "../../middleware/zodvalidate/schema/school/schoolSchemas.js";
import { schoolCreatedMail } from "../../services/emailServices/emailService.js";
import { sign } from "../../services/jwtService/jwtService.js";
import { generateRandomString } from "../../utils/helpers.js";
import { SuccessResponse, ApiError } from "../../utils/apiResponse.js";
import {
  signupSchool,
  querySchoolTableByEmailAndSchoolName,
} from "../../services/dbServices/schoolTable.js";

/**
 *    Single school signup logic for super admin
 */
export const daniraSingleSchoolSignup = async (
  req: Request<SignupSingleSchoolInput>,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.schoolData.email !== req.body.adminData.email) {
    const error = new ApiError(422, "Admin must use school email.");
    return next(error);
  }

  const randomPassword = generateRandomString();
  const defaultPassword = bcrypt.hashSync(randomPassword);
  req.body.adminData.password = defaultPassword;
  req.body.schoolData.createdBy = req.userId;
  req.body.schoolData.approvedBy = req.userId;

  const schoolAlreadyExist = await querySchoolTableByEmailAndSchoolName(
    req.body.schoolData,
  );

  if (schoolAlreadyExist) {
    const error = new ApiError(409, "Conflicting records");
    return next(error);
  }

  if (!schoolAlreadyExist) {
    const created = await signupSchool(req.body);
    if (created) {
      const token = sign({
        admins: created.admin.id,
      });
      const urlData = { token };
      schoolCreatedMail(req.body, urlData);
      return res
        .status(201)
        .send(new SuccessResponse("School Created", created.school));
    }
  }

  const error = new ApiError(422, "Unprocessable Entity");
  return next(error);
};

export const invalidateSchool = (req: Request, res: Response) => {};

export const approveSchool = (req: Request, res: Response) => {};
