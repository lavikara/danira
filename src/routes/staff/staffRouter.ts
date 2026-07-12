import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { authJwtAndRole } from '../../middleware/authorization/authorization.js';
import { pagination } from '../../middleware/pagination/pagination.js';
import { Role } from '../../generated/browser.js';
import { allStaffs } from '../../controller/staff/staffController.js';

const router = Router();

router.get(
  '/all',
  authJwtAndRole(Object.values(Role) as Role[]),
  pagination,
  catchAsync(allStaffs),
);

export default router;
