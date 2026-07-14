import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { Role } from '../../generated/browser.js';
import { loggedInUser } from '../../controller/user/userController.js';

const router = Router();

router.get(
  '/me',
  userAuthorization,
  roleAuthorization(Object.values(Role) as Role[]),
  catchAsync(loggedInUser),
);

export default router;
