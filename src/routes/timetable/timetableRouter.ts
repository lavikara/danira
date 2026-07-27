import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { schoolAuthorization } from '../../middleware/authorization/schoolAuthorization.js';
import { groupAuthorization } from '../../middleware/authorization/groupAuthorization.js';
import { pagination } from '../../middleware/pagination/pagination.js';
import { Role } from '../../generated/browser.js';
import {
  allSingleSchoolTimetable,
  singleSchoolTimetableAnalytics,
  groupTimetableAnalytics,
  allGroupSchoolTimetable,
  getTimetableById,
} from '../../controller/timetable/timetableController.js';

const router = Router();

router.get(
  '/:schoolId/all',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  pagination,
  catchAsync(allSingleSchoolTimetable),
);

router.get(
  '/:schoolId/get-timetable/:timetableId',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  catchAsync(getTimetableById),
);

router.get(
  '/:schoolId/analytics',
  userAuthorization,
  roleAuthorization([Role.SCHOOLADMIN, Role.SUBSCHOOLADMIN, Role.GROUPSCHOOLADMIN]),
  schoolAuthorization,
  catchAsync(singleSchoolTimetableAnalytics),
);

router.get(
  '/:groupId/all-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  pagination,
  catchAsync(allGroupSchoolTimetable),
);

router.get(
  '/:groupId/analytics-group',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  groupAuthorization,
  catchAsync(groupTimetableAnalytics),
);

export default router;
