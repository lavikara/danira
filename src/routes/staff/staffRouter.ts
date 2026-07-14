import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { pagination } from '../../middleware/pagination/pagination.js';
import { Role } from '../../generated/browser.js';
import {
  allSingleSchoolStaffs,
  allGroupSchoolStaffs,
  singleSchoolStaffAnalytics,
  groupSchoolStaffAnalytics,
} from '../../controller/staff/staffController.js';

const router = Router();

router.get(
  '/:schoolId/all',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  pagination,
  catchAsync(allSingleSchoolStaffs),
);

router.get(
  '/:schoolId/analytics',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  catchAsync(singleSchoolStaffAnalytics),
);

router.get(
  '/:groupId/all-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  pagination,
  catchAsync(allGroupSchoolStaffs),
);

router.get(
  '/:groupId/analytics',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  catchAsync(groupSchoolStaffAnalytics),
);

export default router;
