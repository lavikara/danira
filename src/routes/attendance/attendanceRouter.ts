import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { schoolAuthorization } from '../../middleware/authorization/schoolAuthorization.js';
import { groupAuthorization } from '../../middleware/authorization/groupAuthorization.js';
import { pagination } from '../../middleware/pagination/pagination.js';
import { Role } from '../../generated/browser.js';
import {
  allSingleSchoolStaffAttendance,
  allSingleSchoolStudentAttendance,
  singleSchoolStaffAttendanceAnalytics,
  singleSchoolStudentAttendanceAnalytics,
  allGroupSchoolStaffAttendance,
  allGroupSchoolStudentAttendance,
  groupStaffAttendanceAnalytics,
  groupStudentAttendanceAnalytics,
} from '../../controller/attendance/attendanceController.js';

const router = Router();

router.get(
  '/:schoolId/staffs-all',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  pagination,
  catchAsync(allSingleSchoolStaffAttendance),
);

router.get(
  '/:schoolId/students-all',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  pagination,
  catchAsync(allSingleSchoolStudentAttendance),
);

router.get(
  '/:schoolId/staffs-analytics',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  catchAsync(singleSchoolStaffAttendanceAnalytics),
);

router.get(
  '/:schoolId/students-analytics',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  catchAsync(singleSchoolStudentAttendanceAnalytics),
);

router.get(
  '/:groupId/staffs-all-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  pagination,
  catchAsync(allGroupSchoolStaffAttendance),
);

router.get(
  '/:groupId/students-all-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  pagination,
  catchAsync(allGroupSchoolStudentAttendance),
);

router.get(
  '/:groupId/staffs-analytics-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  catchAsync(groupStaffAttendanceAnalytics),
);

router.get(
  '/:groupId/students-analytics-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  catchAsync(groupStudentAttendanceAnalytics),
);

export default router;
