import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { Prisma, AttendanceStatus } from '../../generated/client.js';

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

const toUTCDateOnly = (date: Date): Date =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const toISODateOnly = (date: Date): string => date.toISOString().slice(0, 10);

const ATTENDED_STATUSES: AttendanceStatus[] = [AttendanceStatus.PRESENT, AttendanceStatus.LATE];

export const getStaffAnalyticsData = async (
  where: Prisma.StaffAttendanceWhereInput,
): Promise<AttendanceAnalyticsResult> => {
  const today = toUTCDateOnly(new Date());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);

  const todayStatsArgs = {
    by: ['status'],
    where: { ...where, date: today },
    _count: { _all: true },
  } satisfies Prisma.StaffAttendanceGroupByArgs;

  const todayStats = await prismaClient.staffAttendance.groupBy(todayStatsArgs);

  const countByStatus = (status: AttendanceStatus) =>
    todayStats.find((row) => row.status === status)?._count._all ?? 0;

  const presentToday = countByStatus(AttendanceStatus.PRESENT);
  const absentToday = countByStatus(AttendanceStatus.ABSENT);
  const lateToday = countByStatus(AttendanceStatus.LATE);
  const leaveToday = countByStatus(AttendanceStatus.LEAVE);
  const totalToday = presentToday + absentToday + lateToday + leaveToday;
  const attendanceRate =
    totalToday > 0 ? Number((((presentToday + lateToday) / totalToday) * 100).toFixed(2)) : 0;

  const departmentRecords = await prismaClient.staffAttendance.findMany({
    where: { ...where, date: { gte: thirtyDaysAgo, lte: today } },
    select: {
      status: true,
      staff: {
        select: {
          departmentId: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  const thirtyDayTotal = departmentRecords.length;
  const thirtyDayAttended = departmentRecords.filter((record) =>
    ATTENDED_STATUSES.includes(record.status),
  ).length;
  const thirtyDayAttendanceRate =
    thirtyDayTotal > 0 ? Number(((thirtyDayAttended / thirtyDayTotal) * 100).toFixed(2)) : 0;

  const departmentMap = new Map<string, { name: string; total: number; attended: number }>();
  for (const record of departmentRecords) {
    const key = record.staff.departmentId ?? 'unassigned';
    const name = record.staff.department?.name ?? 'Unassigned';
    const entry = departmentMap.get(key) ?? { name, total: 0, attended: 0 };
    entry.total += 1;
    if (ATTENDED_STATUSES.includes(record.status)) entry.attended += 1;
    departmentMap.set(key, entry);
  }

  const attendanceByDepartment: DepartmentAttendanceStat[] = Array.from(
    departmentMap.entries(),
  ).map(([key, { name, total, attended }]) => ({
    departmentId: key === 'unassigned' ? null : key,
    name,
    attendanceRate: total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0,
  }));

  const rawTrendsArgs = {
    by: ['date'],
    where: {
      ...where,
      date: { gte: thirtyDaysAgo, lte: today },
      status: { in: ATTENDED_STATUSES },
    },
    _count: { _all: true },
  } satisfies Prisma.StaffAttendanceGroupByArgs;

  const rawTrend = await prismaClient.staffAttendance.groupBy(rawTrendsArgs);

  const trendByDate = new Map(rawTrend.map((row) => [toISODateOnly(row.date), row._count._all]));

  const thirtyDaysTrend: DailyTrendPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    const dayOfWeek = day.getUTCDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const key = toISODateOnly(day);
    thirtyDaysTrend.push({ date: key, attendanceCount: trendByDate.get(key) ?? 0 });
  }

  return {
    presentToday,
    absentToday,
    lateToday,
    attendanceRate,
    thirtyDayAttendanceRate,
    attendanceByDepartment,
    thirtyDaysTrend,
  };
};

export const getStudentAnalyticsData = async (
  where: Prisma.StudentAttendanceWhereInput,
): Promise<AttendanceAnalyticsResult> => {
  const today = toUTCDateOnly(new Date());
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setUTCDate(thirtyDaysAgo.getUTCDate() - 29);

  const todayStatsArgs = {
    by: ['attendance'],
    where: { ...where, date: today },
    _count: { _all: true },
  } satisfies Prisma.StudentAttendanceGroupByArgs;

  const todayStats = await prismaClient.studentAttendance.groupBy(todayStatsArgs);

  const countByStatus = (status: AttendanceStatus) =>
    todayStats.find((row) => row.attendance === status)?._count._all ?? 0;

  const presentToday = countByStatus(AttendanceStatus.PRESENT);
  const absentToday = countByStatus(AttendanceStatus.ABSENT);
  const lateToday = countByStatus(AttendanceStatus.LATE);
  const leaveToday = countByStatus(AttendanceStatus.LEAVE);
  const totalToday = presentToday + absentToday + lateToday + leaveToday;
  const attendanceRate =
    totalToday > 0 ? Number((((presentToday + lateToday) / totalToday) * 100).toFixed(2)) : 0;

  const departmentRecords = await prismaClient.studentAttendance.findMany({
    where: { ...where, date: { gte: thirtyDaysAgo, lte: today } },
    select: {
      attendance: true,
      student: {
        select: {
          departmentId: true,
          department: { select: { name: true } },
        },
      },
    },
  });

  const thirtyDayTotal = departmentRecords.length;
  const thirtyDayAttended = departmentRecords.filter((record) =>
    ATTENDED_STATUSES.includes(record.attendance),
  ).length;
  const thirtyDayAttendanceRate =
    thirtyDayTotal > 0 ? Number(((thirtyDayAttended / thirtyDayTotal) * 100).toFixed(2)) : 0;

  const departmentMap = new Map<string, { name: string; total: number; attended: number }>();
  for (const record of departmentRecords) {
    const key = record.student.departmentId ?? 'unassigned';
    const name = record.student.department?.name ?? 'Unassigned';
    const entry = departmentMap.get(key) ?? { name, total: 0, attended: 0 };
    entry.total += 1;
    if (ATTENDED_STATUSES.includes(record.attendance)) entry.attended += 1;
    departmentMap.set(key, entry);
  }

  const attendanceByDepartment: DepartmentAttendanceStat[] = Array.from(
    departmentMap.entries(),
  ).map(([key, { name, total, attended }]) => ({
    departmentId: key === 'unassigned' ? null : key,
    name,
    attendanceRate: total > 0 ? Number(((attended / total) * 100).toFixed(2)) : 0,
  }));

  const rawTrendArgs = {
    by: ['date'],
    where: {
      ...where,
      date: { gte: thirtyDaysAgo, lte: today },
      attendance: { in: ATTENDED_STATUSES },
    },
    _count: { _all: true },
  } satisfies Prisma.StudentAttendanceGroupByArgs;

  const rawTrend = await prismaClient.studentAttendance.groupBy(rawTrendArgs);

  const trendByDate = new Map(rawTrend.map((row) => [toISODateOnly(row.date), row._count._all]));

  const thirtyDaysTrend: DailyTrendPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const day = new Date(today);
    day.setUTCDate(day.getUTCDate() - i);
    const dayOfWeek = day.getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const key = toISODateOnly(day);
    thirtyDaysTrend.push({ date: key, attendanceCount: trendByDate.get(key) ?? 0 });
  }

  return {
    presentToday,
    absentToday,
    lateToday,
    attendanceRate,
    thirtyDayAttendanceRate,
    attendanceByDepartment,
    thirtyDaysTrend,
  };
};
