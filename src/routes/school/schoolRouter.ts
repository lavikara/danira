import { Router } from 'express';
import { catchAsync } from '../../utils/catchAsync.js';
import { authJwtAndRole } from '../../middleware/authorization/authorization.js';
import { Role } from '../../generated/browser.js';
import {
  getSingleSchoolDetails,
  getGroupDetails,
  getGroupSchools,
} from '../../controller/school/schoolController.js';

const router = Router();

router.get(
  '/single-school',
  authJwtAndRole([
    Role.SCHOOLADMIN,
    Role.GROUPSCHOOLADMIN,
    Role.SUBSCHOOLADMIN,
    Role.SCHOOLSTAFF,
    Role.STUDENT,
  ]),
  catchAsync(getSingleSchoolDetails),
);

router.get('/group-schools', authJwtAndRole([Role.GROUPSCHOOLADMIN]), catchAsync(getGroupSchools));

router.get('/group-details', authJwtAndRole([Role.GROUPSCHOOLADMIN]), catchAsync(getGroupDetails));

export default router;
