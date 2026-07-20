import { type Request, type Response, type NextFunction } from 'express';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { ChartJsData } from '../../types/definitions.js';
import { toChartData } from '../../utils/analytics.js';
import { getStaffAnalyticsData } from '../../services/staffService/staffAnalyticsService.js';

const STAFFS_SORTABLE_FIELDS = ['employmentStatus', 'position'] as const;
const resolveSort = createSortWhitelist(STAFFS_SORTABLE_FIELDS, 'position');

export const allSingleSchoolStaffs = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { departmentId, employmentStatus, accomodation } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && departmentId) where.departmentId = departmentId;
  if (schoolId && employmentStatus) where.employmentStatus = employmentStatus;
  if (schoolId && accomodation) where.accomodation = accomodation;

  if (search) {
    where.OR = [
      { position: { contains: search, mode: 'insensitive' } },
      { staffId: { contains: search as string, mode: 'insensitive' } },
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
      subjects: { select: { name: true } },
      _count: {
        select: { lessons: true },
      },
      department: { select: { name: true } },
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

export const singleSchoolStaffAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;

  const staffWhere: Record<string, any> = {};
  if (schoolId) staffWhere.schoolId = schoolId;

  const staffUserWhere: Record<string, any> = { staffs: { schoolId } };

  const [totalStaffs, activeStaffs, staffsOnLeave, ratingAgg, topTeachers] =
    await getStaffAnalyticsData(staffWhere, staffUserWhere, schoolId as string[], 'school');

  const chartItems = topTeachers.map((teacher) => ({
    label: [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.staffId,
    value: teacher.studentCount,
  }));
  const chartBorderRadious = 7;
  const topTeachersChart: ChartJsData = toChartData(
    chartItems,
    'Students Taught',
    chartBorderRadious,
  );
  const timestamp = new Date().toISOString();

  res.json({
    totalStaffs,
    activeStaffs,
    staffsOnLeave,
    averageRating: Number((ratingAgg._avg.ratings ?? 0).toFixed(2)),
    topTeachersByWorkload: {
      chart: topTeachersChart,
      raw: topTeachers,
    },
    timestamp,
    success: true,
    message: 'Staff analytics fetched.',
  });
};

export const allGroupSchoolStaffs = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, departmentId, employmentStatus, accomodation } = req.query;

  const where: Record<string, any> = {
    school: { groupId },
  };

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
      subjects: { select: { name: true } },
      _count: {
        select: { lessons: true },
      },
      department: { select: { name: true } },
    },
  };
  const result = await paginatedResource('staffs', query, 'Fetched all group staffs');

  if (!result.success) {
    throw new Error('Unable to fetch group staffs');
  }

  if (result.success) {
    const normalizedData = (result.data as Array<Record<string, any>>).map((staff) => {
      const { _count, ...rest } = staff;
      return {
        ...rest,
        lessonCount: _count?.lessons ?? 0,
      };
    });

    res.json({
      ...result,
      data: normalizedData,
    });
    return;
  }
};

export const groupStaffAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;

  const staffWhere: Record<string, any> = {};
  const staffUserWhere: Record<string, any> = {};

  const schoolIds = req.schoolIds as string[];

  if (groupId) {
    staffWhere.school = { group: { id: groupId } };
    staffUserWhere.staffs = { school: { group: { id: groupId } } };
  }

  const [totalStaffs, activeStaffs, staffsOnLeave, ratingAgg, topTeachers] =
    await getStaffAnalyticsData(staffWhere, staffUserWhere, schoolIds, 'group');

  const chartItems = topTeachers.map((teacher) => ({
    label: [teacher.firstName, teacher.lastName].filter(Boolean).join(' ') || teacher.staffId,
    value: teacher.studentCount,
  }));

  const chartBorderRadious = 7;
  const topTeachersChart: ChartJsData = toChartData(
    chartItems,
    'Students Taught',
    chartBorderRadious,
  );
  const timestamp = new Date().toISOString();

  res.json({
    totalStaffs,
    activeStaffs,
    staffsOnLeave,
    averageRating: Number((ratingAgg._avg.ratings ?? 0).toFixed(2)),
    topTeachersByWorkload: {
      chart: topTeachersChart,
      raw: topTeachers,
    },
    timestamp,
    success: true,
    message: 'Staff analytics fetched.',
  });
};
