import { type Request, type Response, type NextFunction } from 'express';
import { SignupSchoolInput } from '../../middleware/zodvalidate/schema/school/schoolSchemas.js';
import {
  schoolCreatedByDaniraMail,
  schoolApprovedMail,
} from '../../services/emailServices/emailService.js';
import { sign } from '../../services/jwtService/jwtService.js';
import { SuccessResponse, ApiError } from '../../utils/apiResponse.js';
import { ReturnResponse } from '../../types/definitions.js';
import { daniraSchoolSignup } from '../../services/schoolService/createSchoolService.js';
import { approveSchoolService } from '../../services/schoolService/approveSchoolService.js';

/**
 *    Single school signup logic for super admin
 */
export const schoolSignup = async (
  req: Request<SignupSchoolInput>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const signupSchool: ReturnResponse = await daniraSchoolSignup(
    req.body,
    req?.userId,
    req?.userRole,
  );
  if (!signupSchool?.success) {
    const error = new ApiError(422, signupSchool?.message);
    next(error);
    return;
  }

  if (signupSchool?.success) {
    const token = await sign({
      admins: signupSchool.data.admin.id,
    });
    const urlData = { token };
    schoolCreatedByDaniraMail(req.body, urlData);
    res.status(201).send(new SuccessResponse(signupSchool?.message, signupSchool?.data.school));
    return;
  }
};

export const approveSchool = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const approved: ReturnResponse = await approveSchoolService(req.body, req?.userId);
  if (!approved?.success) {
    const error = new ApiError(422, approved?.message);
    next(error);
    return;
  }
  if (approved?.success) {
    const token = await sign({ admins: approved.data.users.admins.id }, 3600);
    const urlData = { token };
    schoolApprovedMail(approved.data, urlData);
    res.status(200).send(new SuccessResponse(approved?.message, approved?.data.schools));
    return;
  }
};
