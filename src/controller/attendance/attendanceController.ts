import { type Request, type Response, type NextFunction } from 'express';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { toChartData } from '../../utils/analytics.js';
import { AttendanceStatus } from '../../generated/browser.js';
import {
  getStaffAnalyticsData,
  getStudentAnalyticsData,
} from '../../services/attendanceService/attendanceAnalyticsService.js';

const STAFF_ATTENDANCE_SORTABLE_FIELDS = ['date', 'status', 'staffId'] as const;
const STUDENT_ATTENDANCE_SORTABLE_FIELDS = ['date', 'attendance', 'studentId'] as const;

const chartBorderRadious = 7;

const trendChartBorderRadious = 0;

const resolveStaffAttendanceSort = createSortWhitelist(STAFF_ATTENDANCE_SORTABLE_FIELDS, 'date', {
  date: (order) => ({ date: order }),
  status: (order) => ({ status: order }),
  staffId: (order) => ({ staffId: order }),
});

const resolveStudentAttendanceSort = createSortWhitelist(
  STUDENT_ATTENDANCE_SORTABLE_FIELDS,
  'date',
  {
    date: (order) => ({ date: order }),
    attendance: (order) => ({ attendance: order }),
    studentId: (order) => ({ studentId: order }),
  },
);

const ATTENDANCE_STATUS_VALUES = Object.values(AttendanceStatus);

function matchedStatuses(search: string): AttendanceStatus[] {
  const term = search.toLowerCase();
  return ATTENDANCE_STATUS_VALUES.filter((value) => value.toLowerCase().includes(term));
}

interface DepartmentAttendanceStat {
  departmentId: string | null;
  name: string;
  attendanceRate: number;
}

interface DailyTrendPoint {
  date: string;
  attendanceCount: number;
}

interface AttendanceAnalyticsResult {
  presentToday: number;
  absentToday: number;
  lateToday: number;
  attendanceRate: number;
  thirtyDayAttendanceRate: number;
  attendanceByDepartment: DepartmentAttendanceStat[];
  thirtyDaysTrend: DailyTrendPoint[];
}

const buildAttendanceAnalyticsPayload = (
  result: AttendanceAnalyticsResult,
  chartType: 'staffAttendance' | 'studentAttendance',
  entityLabel: 'Staff' | 'Student',
) => {
  const departmentChartItems = result.attendanceByDepartment.map((item) => ({
    label: item.name,
    value: item.attendanceRate,
  }));

  const trendChartItems = result.thirtyDaysTrend.map((item) => ({
    label: item.date,
    value: item.attendanceCount,
  }));

  return {
    presentToday: result.presentToday,
    absentToday: result.absentToday,
    lateToday: result.lateToday,
    attendanceRate: result.attendanceRate,
    thirtyDayAttendanceRate: result.thirtyDayAttendanceRate,
    attendanceByDepartment: {
      chart: toChartData(departmentChartItems, chartType, chartBorderRadious),
    },
    thirtyDaysTrend: {
      chart: toChartData(trendChartItems, chartType, trendChartBorderRadious),
    },
    timestamp: new Date().toISOString(),
    success: true,
    message: `${entityLabel} attendance analytics fetched.`,
  };
};

export const allSingleSchoolStaffAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { status, date, staffsId } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && date) where.date = new Date(date as string);
  if (schoolId && status) where.status = status;
  if (schoolId && staffsId) where.staffId = staffsId;

  if (search) {
    const searchTerm = search as string;
    const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean);
    const statusMatches = matchedStatuses(searchTerm);

    where.OR = [
      ...(statusMatches.length ? [{ status: { in: statusMatches } }] : []),
      { staff: { staffId: { contains: searchTerm, mode: 'insensitive' } } },
      {
        staff: {
          users: {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              {
                AND: searchWords.map((word) => ({
                  OR: [
                    { firstName: { contains: word, mode: 'insensitive' } },
                    { lastName: { contains: word, mode: 'insensitive' } },
                  ],
                })),
              },
            ],
          },
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveStaffAttendanceSort(sortBy, order),
    include: {
      staff: {
        include: {
          users: { omit: { password: true } },
        },
      },
    },
  };

  const result = await paginatedResource('staffAttendance', query, 'Fetched all staff attendance');
  if (!result.success) {
    throw new Error('Unable to fetch staff attendance');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};

export const allSingleSchoolStudentAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { attendance, date, studentId } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && date) where.date = new Date(date as string);
  if (schoolId && attendance) where.attendance = attendance;
  if (schoolId && studentId) where.studentId = studentId;

  if (search) {
    const searchTerm = search as string;
    const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean);
    const statusMatches = matchedStatuses(searchTerm);

    where.OR = [
      ...(statusMatches.length ? [{ attendance: { in: statusMatches } }] : []),
      { student: { studentId: { contains: searchTerm, mode: 'insensitive' } } },
      {
        student: {
          users: {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              {
                AND: searchWords.map((word) => ({
                  OR: [
                    { firstName: { contains: word, mode: 'insensitive' } },
                    { lastName: { contains: word, mode: 'insensitive' } },
                  ],
                })),
              },
            ],
          },
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveStudentAttendanceSort(sortBy, order),
    include: {
      student: {
        include: {
          users: { omit: { password: true } },
        },
      },
      lesson: { include: { classInfo: true } },
    },
  };

  const result = await paginatedResource(
    'studentAttendance',
    query,
    'Fetched all student attendance',
  );
  if (!result.success) {
    throw new Error('Unable to fetch student attendance');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};

export const singleSchoolStaffAttendanceAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId } = req.params;

    const attendanceWhere: Record<string, any> = {};
    if (schoolId) attendanceWhere.schoolId = schoolId;

    const result = await getStaffAnalyticsData(attendanceWhere);
    res.json(buildAttendanceAnalyticsPayload(result, 'staffAttendance', 'Staff'));
  } catch (error) {
    next(error);
  }
};

export const singleSchoolStudentAttendanceAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { schoolId } = req.params;

    const attendanceWhere: Record<string, any> = {};
    if (schoolId) attendanceWhere.schoolId = schoolId;

    const result = await getStudentAnalyticsData(attendanceWhere);
    res.json(buildAttendanceAnalyticsPayload(result, 'studentAttendance', 'Student'));
  } catch (error) {
    next(error);
  }
};

export const allGroupSchoolStaffAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, status, date, staffsId } = req.query;
  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) where.schoolId = schoolId;
  if (date) where.date = new Date(date as string);
  if (status) where.status = status;
  if (staffsId) where.staffId = staffsId;

  if (search) {
    const searchTerm = search as string;
    const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean);
    const statusMatches = matchedStatuses(searchTerm);

    where.OR = [
      ...(statusMatches.length ? [{ status: { in: statusMatches } }] : []),
      { staff: { staffId: { contains: searchTerm, mode: 'insensitive' } } },
      {
        staff: {
          users: {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              {
                AND: searchWords.map((word) => ({
                  OR: [
                    { firstName: { contains: word, mode: 'insensitive' } },
                    { lastName: { contains: word, mode: 'insensitive' } },
                  ],
                })),
              },
            ],
          },
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveStaffAttendanceSort(sortBy, order),
    include: {
      staff: {
        include: {
          users: { omit: { password: true } },
        },
      },
    },
  };

  const result = await paginatedResource('staffAttendance', query, 'Fetched all attendance');
  if (!result.success) {
    throw new Error('Unable to fetch attendance');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};

export const allGroupSchoolStudentAttendance = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, attendance, date, studentId } = req.query;
  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) where.schoolId = schoolId;
  if (date) where.date = new Date(date as string);
  if (attendance) where.attendance = attendance;
  if (studentId) where.studentId = studentId;

  if (search) {
    const searchTerm = search as string;
    const searchWords = searchTerm.trim().split(/\s+/).filter(Boolean);
    const statusMatches = matchedStatuses(searchTerm);

    where.OR = [
      ...(statusMatches.length ? [{ attendance: { in: statusMatches } }] : []),
      { student: { studentId: { contains: searchTerm, mode: 'insensitive' } } },
      {
        student: {
          users: {
            OR: [
              { email: { contains: searchTerm, mode: 'insensitive' } },
              {
                AND: searchWords.map((word) => ({
                  OR: [
                    { firstName: { contains: word, mode: 'insensitive' } },
                    { lastName: { contains: word, mode: 'insensitive' } },
                  ],
                })),
              },
            ],
          },
        },
      },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveStudentAttendanceSort(sortBy, order),
    include: {
      student: {
        include: {
          users: { omit: { password: true } },
        },
      },
      lesson: { include: { classInfo: true } },
    },
  };

  const result = await paginatedResource('studentAttendance', query, 'Fetched all attendance');
  if (!result.success) {
    throw new Error('Unable to fetch attendance');
  }

  if (result.success) {
    res.json(result);
    return;
  }
};

export const groupStaffAttendanceAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { groupId } = req.params;

    const attendanceWhere: Record<string, any> = {};
    if (groupId) attendanceWhere.school = { groupId };

    const result = await getStaffAnalyticsData(attendanceWhere);
    res.json(buildAttendanceAnalyticsPayload(result, 'staffAttendance', 'Staff'));
  } catch (error) {
    next(error);
  }
};

export const groupStudentAttendanceAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { groupId } = req.params;

    const attendanceWhere: Record<string, any> = {};
    if (groupId) attendanceWhere.school = { groupId };

    const result = await getStudentAnalyticsData(attendanceWhere);
    res.json(buildAttendanceAnalyticsPayload(result, 'studentAttendance', 'Student'));
  } catch (error) {
    next(error);
  }
};
