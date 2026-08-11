import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { staffAuthorization } from '../../middleware/authorization/staffAuthorization.js';
import { schoolAuthorization } from '../../middleware/authorization/schoolAuthorization.js';
import { groupAuthorization } from '../../middleware/authorization/groupAuthorization.js';
import { pagination } from '../../middleware/pagination/pagination.js';
import { Role } from '../../generated/browser.js';
import {
  allSingleSchoolStudent,
  allStaffStudent,
  singleSchoolStudentAnalytics,
  groupStudentAnalytics,
  allGroupSchoolStudent,
  staffStudentAnalytics,
} from '../../controller/student/studentController.js';

const router = Router();

router.get(
  '/:schoolId/all',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  pagination,
  catchAsync(allSingleSchoolStudent),
);

router.get(
  '/:schoolId/staff/:staffId/all',
  userAuthorization,
  roleAuthorization([Role.SCHOOLSTAFF]),
  schoolAuthorization,
  staffAuthorization,
  pagination,
  catchAsync(allStaffStudent),
);

router.get(
  '/:schoolId/staff/:staffId/analytics',
  userAuthorization,
  roleAuthorization([Role.SCHOOLSTAFF]),
  schoolAuthorization,
  staffAuthorization,
  pagination,
  catchAsync(staffStudentAnalytics),
);

router.get(
  '/:schoolId/analytics',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  catchAsync(singleSchoolStudentAnalytics),
);

router.get(
  '/:groupId/all-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  pagination,
  catchAsync(allGroupSchoolStudent),
);

router.get(
  '/:groupId/analytics-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  catchAsync(groupStudentAnalytics),
);

export default router;
