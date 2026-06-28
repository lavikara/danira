import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { validate } from '../../middleware/zodvalidate/validate.js';
import { signupSchoolSchema } from '../../middleware/zodvalidate/schema/school/schoolSchemas.js';
import {
  loginSchema,
  resetPasswordSchema,
  forgotPasswordSchema,
} from '../../middleware/zodvalidate/schema/auth/authSchemas.js';
import {
  userSchoolSignup,
  login,
  resetPassword,
  forgotPassword,
} from '../../controller/auth/authController.js';

const router = Router();

/**
 *    This route handles login for all type of user
 */
router.post('/login', validate({ body: loginSchema.shape.body }), catchAsync(login));

/**
 *    This route handles reset password for all users
 *    user.
 */
router.patch(
  '/reset-password',
  validate({ body: resetPasswordSchema.shape.body }),
  catchAsync(resetPassword),
);

/**
 *    This route handles forgot password for all users
 *    user.
 */
router.post(
  '/forgot-password',
  validate({ body: forgotPasswordSchema.shape.body }),
  catchAsync(forgotPassword),
);

/**
 *    This route handles school signup by a school admin.
 */
router.post('/signup', validate({ body: signupSchoolSchema }), catchAsync(userSchoolSignup));

export default router;
