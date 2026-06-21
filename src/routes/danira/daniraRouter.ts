import { Router } from "express";
import { catchAsync } from "../../utils/catchAsync.js";
import { validate } from "../../middleware/zodvalidate/validate.js";
import { signupSchoolSchema } from "../../middleware/zodvalidate/schema/school/schoolSchemas.js";
import { authJwtAndRole } from "../../middleware/authorization/authorization.js";
import { Role } from "../../generated/browser.js";
import {
  invalidateSchool,
  approveSchool,
  daniraSingleSchoolSignup,
} from "../../controller/danira/daniraController.js";

const router = Router();

/**
 *    This route handles school signup by a super admin
 */
router.post(
  "/signup-single-school",
  authJwtAndRole([Role.SUPERADMIN]),
  validate({ body: signupSchoolSchema }),
  catchAsync(daniraSingleSchoolSignup),
);

router.post("/approve-school", approveSchool);

router.post("/invalidate-school", invalidateSchool);

export default router;
