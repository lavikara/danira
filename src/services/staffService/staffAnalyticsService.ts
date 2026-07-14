import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { ChartJsBarData } from '../../types/definitions.js';
import { toBarChartData } from '../../utils/analytics.js';
import { ApproveOrInvalidateSchoolInput } from '../../middleware/zodvalidate/schema/school/schoolSchemas.js';
import { ReturnResponse } from '../../types/definitions.js';
import { findUniqueSchool, findUniqueUser } from '../dbServices/dbServices.js';

interface TeacherWorkload {
  staffId: string;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  schoolId: string | null;
  studentCount: number;
}

export async function getAnalyticsData(
  staffWhere: Record<string, any>,
  staffUserWhere: Record<string, any>,
  schoolId: string | undefined,
): Promise<[number, number, number, { _avg: { ratings: number | null } }, TeacherWorkload[]]> {
  return await Promise.all([
    prismaClient.staffs.count({ where: staffWhere }),
    prismaClient.staffs.count({
      where: { ...staffWhere, users: { status: 'ACTIVE' } },
    }),
    prismaClient.staffs.count({
      where: { ...staffWhere, users: { status: 'LEAVE' } },
    }),
    prismaClient.users.aggregate({
      where: staffUserWhere,
      _avg: { ratings: true },
    }),
    getTopTeachersByWorkload(schoolId as string | undefined),
  ]);
}

/**
 * Workload = number of distinct students a staff member teaches, derived
 * from Lessons (staffId + classId), not Classes.supervisorId — a teacher
 * can teach several classes without being the supervisor of any of them.
 *
 * Two queries total, regardless of how many staff/classes exist:
 *   1. distinct (staffId, classId) pairs from Lessons
 *   2. student counts grouped by classId for just those classes
 * Everything else is combined in memory.
 */

async function getTopTeachersByWorkload(schoolId?: string): Promise<TeacherWorkload[]> {
  const lessonWhere: Record<string, any> = {};
  if (schoolId) lessonWhere.staff = { schoolId };

  // distinct() ensures a teacher who teaches the same class across
  // multiple subjects/lessons only has that class's students counted once.
  const distinctPairs = await prismaClient.lessons.findMany({
    where: lessonWhere,
    select: { staffId: true, classId: true },
    distinct: ['staffId', 'classId'],
  });

  if (distinctPairs.length === 0) return [];

  const classIds = [...new Set(distinctPairs.map((p) => p.classId))];

  const studentCounts = (await prismaClient.students.groupBy({
    by: ['classId'],
    where: { classId: { in: classIds } },
    _count: { _all: true },
  })) as Array<{ classId: string; _count: { _all: number } }>;

  const countByClass = new Map<string, number>(
    studentCounts.map((c) => [c.classId, c._count._all]),
  );

  const workloadByStaff = new Map<string, number>();
  for (const pair of distinctPairs) {
    const studentsInClass = countByClass.get(pair.classId) ?? 0;
    workloadByStaff.set(pair.staffId, (workloadByStaff.get(pair.staffId) ?? 0) + studentsInClass);
  }

  const topStaffIds = [...workloadByStaff.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([staffId]) => staffId);

  const staffDetails = await prismaClient.staffs.findMany({
    where: { id: { in: topStaffIds } },
    select: {
      id: true,
      position: true,
      schoolId: true,
      users: { select: { firstName: true, lastName: true } },
    },
  });

  const detailsById = new Map(staffDetails.map((s) => [s.id, s]));

  // Re-sort against topStaffIds to preserve workload order — findMany's
  // `in` filter does not guarantee it matches the input array's order.
  return topStaffIds.map((staffId) => {
    const detail = detailsById.get(staffId);
    return {
      staffId,
      firstName: detail?.users.firstName ?? null,
      lastName: detail?.users.lastName ?? null,
      position: detail?.position ?? null,
      schoolId: detail?.schoolId ?? null,
      studentCount: workloadByStaff.get(staffId) ?? 0,
    };
  });
}
