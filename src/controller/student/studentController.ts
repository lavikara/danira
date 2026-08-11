import { type Request, type Response, type NextFunction } from 'express';
import { Prisma } from '../../generated/client.js';
import { ChartJsData } from '../../types/definitions.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { getStudentAnalyticsData } from '../../services/studentService/studentsAnalyticsService.js';
import { PaginatedStudentQuery } from '../../services/paginationService/paginate.js';
import { toChartData } from '../../utils/analytics.js';

const CHART_BORDER_RADIUS = 7;

const STUDENTS_SORTABLE_FIELDS = ['department', 'classInfo'] as const;

const resolveSort = createSortWhitelist(STUDENTS_SORTABLE_FIELDS, 'classInfo', {
  classInfo: (order) => ({ classInfo: { name: order } }),
  department: (order) => ({ department: { name: order } }),
});

const resolveAttendancePercentage = (attendances: { attendance: string }[]): number | null => {
  if (attendances.length === 0) return null;
  const presentCount = attendances.filter((record) => record.attendance === 'PRESENT').length;
  return Math.round((presentCount / attendances.length) * 1000) / 10;
};

const buildStaffStudentWhere = (staffId: string): Record<string, any> => ({
  OR: [
    { classInfo: { supervisorId: staffId } },
    { classInfo: { subjectOfferings: { some: { staffId } } } },
    { boardingHouse: { matrons: { some: { staffId } } } },
  ],
});

export const allStaffStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { staffId } = req.params;

  if (!staffId) {
    res.status(400).json({ success: false, message: 'staffId is required' });
    return;
  }

  const { page, limit, sortBy, order, search } = req.pagination;
  const { departmentId, department, accomodation } = req.query;

  const andFilters: Record<string, any>[] = [buildStaffStudentWhere(staffId as string)];

  if (departmentId) andFilters.push({ departmentId });
  if (department) andFilters.push({ department: { name: String(department) } });
  if (accomodation) andFilters.push({ accomodation: String(accomodation) });

  if (search) {
    const value = String(search);

    andFilters.push({
      OR: [
        { classInfo: { name: { contains: value, mode: 'insensitive' } } },
        { studentId: { contains: value, mode: 'insensitive' } },
        {
          users: {
            OR: [
              { firstName: { contains: value, mode: 'insensitive' } },
              { lastName: { contains: value, mode: 'insensitive' } },
              { email: { contains: value, mode: 'insensitive' } },
            ],
          },
        },
      ],
    });
  }

  const query = {
    where: { AND: andFilters },
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      users: { omit: { password: true } },
      subjects: { select: { name: true } },
      department: { select: { name: true } },
      classInfo: { select: { id: true, name: true } },
      fees: true,
      attendances: { select: { attendance: true } },
    },
  } satisfies PaginatedStudentQuery;

  const result = await paginatedResource('students', query, 'Fetched all staff students');

  if (!result.success) {
    throw new Error('Unable to fetch students');
  }

  result.data = result.data.map(({ attendances, ...student }) => ({
    ...student,
    attendances: resolveAttendancePercentage(attendances),
  }));

  res.json(result);
};

export const staffStudentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId, staffId } = req.params;

  const studentWhere: Record<string, any> = {
    AND: [buildStaffStudentWhere(staffId as string)],
  };
  if (schoolId) studentWhere.schoolId = schoolId;

  const [
    totalStudents,
    activeStudents,
    newIntakes,
    outstandingFees,
    studentsByDepartment,
    studentsByGender,
  ] = await getStudentAnalyticsData(studentWhere, [schoolId] as string[], 'school');

  const departmentChartItems = studentsByDepartment.map((department) => ({
    label: [department.name].filter(Boolean).join(' ') || department.departmentId,
    value: department.studentCount,
  }));

  const studentByDepartmentChart: ChartJsData = toChartData(
    departmentChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const genderChartItems = studentsByGender.map((entry) => ({
    label: entry.gender === 'MALE' ? 'Male' : 'Female',
    value: entry.count,
  }));

  const studentByGenderChart: ChartJsData = toChartData(
    genderChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalStudents,
    activeStudents,
    newIntakes,
    outstandingFees,
    studentsByDepartment: {
      chart: studentByDepartmentChart,
    },
    studentsByGender: {
      chart: studentByGenderChart,
    },
    timestamp,
    success: true,
    message: 'Staff student analytics fetched.',
  });
};

export const allSingleSchoolStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { departmentId, department, accomodation } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && departmentId) where.departmentId = departmentId;
  if (schoolId && department) where.department = { name: department };
  if (schoolId && accomodation) where.accomodation = accomodation;

  if (search) {
    where.OR = [
      { classInfo: { name: { contains: search as string, mode: 'insensitive' } } },
      { studentId: { contains: search as string, mode: 'insensitive' } },
      {
        users: {
          OR: [
            { firstName: { contains: search as string, mode: 'insensitive' } },
            { lastName: { contains: search as string, mode: 'insensitive' } },
            { email: { contains: search as string, mode: 'insensitive' } },
          ],
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      users: { omit: { password: true } },
      subjects: { select: { name: true } },
      department: { select: { name: true } },
      classInfo: { select: { id: true, name: true } },
      fees: true,
      attendances: { select: { attendance: true } },
    },
  } satisfies PaginatedStudentQuery;

  let result = await paginatedResource('students', query, 'Fetched all students');

  if (!result.success) {
    throw new Error('Unable to fetch students');
  }

  const data = result.data.map(({ attendances, ...student }) => ({
    ...student,
    attendances: resolveAttendancePercentage(attendances),
  }));

  result.data = data;

  if (result.success) {
    res.json(result);
    return;
  }
};

export const singleSchoolStudentAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;

  const studentWhere: Record<string, any> = {};
  if (schoolId) studentWhere.schoolId = schoolId;

  const [
    totalStudents,
    activeStudents,
    newIntakes,
    outstandingFees,
    studentsByDepartment,
    studentsByGender,
  ] = await getStudentAnalyticsData(studentWhere, [schoolId] as string[], 'school');

  const departmentChartItems = studentsByDepartment.map((department) => ({
    label: [department.name].filter(Boolean).join(' ') || department.departmentId,
    value: department.studentCount,
  }));

  const studentByDepartmentChart: ChartJsData = toChartData(
    departmentChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const genderChartItems = studentsByGender.map((entry) => ({
    label: entry.gender === 'MALE' ? 'Male' : 'Female',
    value: entry.count,
  }));

  const studentByGenderChart: ChartJsData = toChartData(
    genderChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalStudents,
    activeStudents,
    newIntakes,
    outstandingFees,
    studentsByDepartment: {
      chart: studentByDepartmentChart,
    },
    studentsByGender: {
      chart: studentByGenderChart,
    },
    timestamp,
    success: true,
    message: 'Student analytics fetched.',
  });
};

export const allGroupSchoolStudent = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, departmentId, department, accomodation } = req.query;

  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) {
    where.AND = [{ schoolId }];
  }
  if (departmentId) where.departmentId = departmentId;
  if (department) where.department = department;
  if (accomodation) where.accomodation = accomodation;

  if (search) {
    where.OR = [
      { classInfo: { name: { contains: search as string, mode: 'insensitive' } } },
      { studentId: { contains: search as string, mode: 'insensitive' } },
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
    orderBy: resolveSort(sortBy, order),
    include: {
      users: { omit: { password: true } },
      subjects: { select: { name: true } },
      department: { select: { name: true } },
      classInfo: { select: { id: true, name: true } },
      fees: true,
      attendances: { select: { attendance: true } },
    },
  } satisfies PaginatedStudentQuery;

  let result = await paginatedResource('students', query, 'Fetched all students');

  if (!result.success) {
    throw new Error('Unable to fetch students');
  }

  const data = result.data.map(({ attendances, ...student }) => ({
    ...student,
    attendances: resolveAttendancePercentage(attendances),
  }));

  result.data = data;

  if (result.success) {
    res.json(result);
    return;
  }
};

export const groupStudentAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;

  const studentWhere: Record<string, any> = {};

  if (groupId) {
    studentWhere.school = { group: { id: groupId } };
  }

  const [
    totalStudents,
    activeStudents,
    newIntakes,
    outstandingFees,
    studentsByDepartment,
    studentsByGender,
  ] = await getStudentAnalyticsData(studentWhere, [groupId as string], 'group');

  const departmentChartItems = studentsByDepartment.map((department) => ({
    label: [department.name].filter(Boolean).join(' ') || department.departmentId,
    value: department.studentCount,
  }));

  const studentByDepartmentChart: ChartJsData = toChartData(
    departmentChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const genderChartItems = studentsByGender.map((entry) => ({
    label: entry.gender === 'MALE' ? 'Male' : 'Female',
    value: entry.count,
  }));
  const studentByGenderChart: ChartJsData = toChartData(
    genderChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalStudents,
    activeStudents,
    newIntakes,
    outstandingFees,
    studentsByDepartment: {
      chart: studentByDepartmentChart,
    },
    studentsByGender: {
      chart: studentByGenderChart,
    },
    timestamp,
    success: true,
    message: 'Student analytics fetched.',
  });
};
