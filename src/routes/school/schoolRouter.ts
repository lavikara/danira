import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { roleAuthorization } from '../../middleware/authorization/roleAuthorization.js';
import { userAuthorization } from '../../middleware/authorization/userAuthorization.js';
import { pagination } from '../../middleware/pagination/pagination.js';
import { Role } from '../../generated/browser.js';
import {
  getSingleSchoolDetails,
  getGroupDetails,
  getGroupSchools,
} from '../../controller/school/schoolController.js';

const router = Router();

router.get(
  '/:schoolId/single-school',
  userAuthorization,
  roleAuthorization([
    Role.SCHOOLADMIN,
    Role.GROUPSCHOOLADMIN,
    Role.SUBSCHOOLADMIN,
    Role.SCHOOLSTAFF,
    Role.STUDENT,
  ]),
  catchAsync(getSingleSchoolDetails),
);

router.get(
  '/:groupId/group-schools',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  pagination,
  catchAsync(getGroupSchools),
);

router.get(
  '/:groupId/group-details',
  userAuthorization,
  roleAuthorization([Role.GROUPSCHOOLADMIN]),
  catchAsync(getGroupDetails),
);

export default router;
