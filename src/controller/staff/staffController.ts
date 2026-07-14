import { type Request, type Response, type NextFunction } from 'express';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { ChartJsBarData } from '../../types/definitions.js';
import { toBarChartData } from '../../utils/analytics.js';
import { getAnalyticsData } from '../../services/staffService/staffAnalyticsService.js';

const STAFFS_SORTABLE_FIELDS = ['employmentStatus', 'position'] as const;
const resolveSort = createSortWhitelist(STAFFS_SORTABLE_FIELDS, 'position');

export const allSingleSchoolStaffs = async (req: Request, res: Response, next: NextFunction) => {
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId } = req.params;
  const { departmentId, employmentStatus, accomodation } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && departmentId) where.departmentId = departmentId;
  if (schoolId && employmentStatus) where.employmentStatus = employmentStatus;
  if (schoolId && accomodation) where.accomodation = accomodation;

  if (search) {
    where.OR = [
      { position: { contains: search, mode: 'insensitive' } },
      {
        users: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: { [resolveSort(sortBy)]: order },
    include: {
      users: { omit: { password: true } },
      subjects: true,
    },
  };

  const result = await paginatedResource('staffs', query, 'Fetched all staffs');

  if (!result.success) {
    throw new Error('Unable to fetch staffs');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};

export const allGroupSchoolStaffs = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  // Optional narrowing filters within the group, e.g.
  // /api/school-groups/:groupId/staffs?schoolId=...&employmentStatus=FULLTIME
  const { schoolId, departmentId, employmentStatus, accomodation } = req.query;

  const where: Record<string, any> = {
    school: { groupId },
  };

  // schoolId here further narrows to one school within the group —
  // still validated to actually belong to the group via the AND below.
  if (schoolId) {
    where.AND = [{ schoolId }];
  }
  if (departmentId) where.departmentId = departmentId;
  if (employmentStatus) where.employmentStatus = employmentStatus;
  if (accomodation) where.accomodation = accomodation;

  if (search) {
    where.OR = [
      { position: { contains: search, mode: 'insensitive' } },
      {
        users: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: { [resolveSort(sortBy)]: order },
    include: {
      users: { omit: { password: true } },
      subjects: true,
    },
  };
  const result = await paginatedResource('staffs', query, 'Fetched all group staffs');

  if (!result.success) {
    throw new Error('Unable to fetch group staffs');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};

export const singleSchoolStaffAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.query;

  const staffWhere: Record<string, any> = {};
  if (schoolId) staffWhere.schoolId = schoolId;

  // Users whose only tie to being "staff" is the 1:1 Staffs relation —
  // scoped by schoolId through that relation when provided.
  const staffUserWhere: Record<string, any> = schoolId
    ? { staffs: { schoolId } }
    : { staffs: { isNot: null } };

  const [totalStaffs, activeStaffs, staffsOnLeave, ratingAgg, topTeachers] = await getAnalyticsData(
    staffWhere,
    staffUserWhere,
    schoolId as string,
  );

  const chartItems = topTeachers.map((teacher) => ({
    label: [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.staffId,
    value: teacher.studentCount,
  }));

  const topTeachersChart: ChartJsBarData = toBarChartData(chartItems, 'Students Taught');

  res.json({
    totalStaffs,
    activeStaffs,
    staffsOnLeave,
    averageRating: Number((ratingAgg._avg.ratings ?? 0).toFixed(2)),
    topTeachersByWorkload: {
      // Drop straight into <Bar data={topTeachersByWorkload.chart} />
      chart: topTeachersChart,
      // Full rows too, for a table, tooltips, or linking to a staff profile.
      raw: topTeachers,
    },
  });
};

export const groupSchoolStaffAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {};
