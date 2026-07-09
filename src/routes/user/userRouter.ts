import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { authJwtAndRole } from '../../middleware/authorization/authorization.js';
import { Role } from '../../generated/browser.js';
import { loggedInUser } from '../../controller/user/userController.js';

const router = Router();

router.get('/me', authJwtAndRole(Object.values(Role) as Role[]), catchAsync(loggedInUser));

export default router;
