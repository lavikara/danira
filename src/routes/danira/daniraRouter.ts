import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { validate } from '../../middleware/zodvalidate/validate.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { Role } from '../../generated/browser.js';
import {
  signupSchoolSchema,
  approveOrInvalidateSchoolSchema,
} from '../../middleware/zodvalidate/schema/school/schoolSchemas.js';
import { approveSchool, schoolSignup } from '../../controller/danira/daniraController.js';

const router = Router();

/**
 *    This route handles school signup by a super admin
 */
router.post(
  '/signup-school',
  userAuthorization,
  roleAuthorization([Role.SUPERADMIN]),
  validate({ body: signupSchoolSchema }),
  catchAsync(schoolSignup),
);

router.post(
  '/approve-school',
  userAuthorization,
  roleAuthorization([Role.SUPERADMIN]),
  validate({ body: approveOrInvalidateSchoolSchema }),
  approveSchool,
);

export default router;
