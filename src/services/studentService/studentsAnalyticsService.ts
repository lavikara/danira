import { prismaClient } from '../dbServices/dbClient/prismaClient.js';

interface StudentsByDepartment {
  departmentId: string;
  name: string | null;
  studentCount: number;
}

interface StudentsByGender {
  gender: 'MALE' | 'FEMALE';
  count: number;
}

export async function getStudentAnalyticsData(
  studentWhere: Record<string, any>,
  schoolId: string[],
  scopeType: 'school' | 'group',
): Promise<[number, number, number, number, StudentsByDepartment[], StudentsByGender[]]> {
  const fourMonthsAgo = new Date();
  fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);

  return await Promise.all([
    prismaClient.students.count({ where: studentWhere }),
    prismaClient.students.count({
      where: { ...studentWhere, users: { status: 'ACTIVE' } },
    }),
    prismaClient.students.count({
      where: { ...studentWhere, users: { createdAt: { gte: fourMonthsAgo } } },
    }),
    prismaClient.students.count({
      where: {
        ...studentWhere,
        OR: [{ fees: { none: {} } }, { fees: { some: { status: { in: ['UNPAID', 'PARTIAL'] } } } }],
      },
    }),
    getStudentsByDepartment(schoolId, scopeType),
    getStudentsByGender(studentWhere),
  ]);
}

async function getStudentsByGender(studentWhere: Record<string, any>): Promise<StudentsByGender[]> {
  const [male, female] = await Promise.all([
    prismaClient.students.count({
      where: { ...studentWhere, users: { gender: 'MALE' } },
    }),
    prismaClient.students.count({
      where: { ...studentWhere, users: { gender: 'FEMALE' } },
    }),
  ]);

  return [
    { gender: 'MALE', count: male },
    { gender: 'FEMALE', count: female },
  ];
}

async function getStudentsByDepartment(
  scopeId?: string[],
  scopeType: 'school' | 'group' = 'school',
): Promise<StudentsByDepartment[]> {
  if (!scopeId || scopeId.length === 0) return [];
  // Filter shared by both the Departments query and the "unassigned" Students count.
  // Departments and Students both carry a direct schoolId, so 'school' scope applies
  // to either model. For 'group' scope we go through the school relation to groupId.
  const scopeFilter: Record<string, any> =
    scopeType === 'school'
      ? { schoolId: { in: scopeId } }
      : { school: { groupId: { in: scopeId } } };
  const [departments, unassignedCount] = await Promise.all([
    prismaClient.departments.findMany({
      where: scopeFilter,
      select: {
        id: true,
        name: true,
        _count: { select: { students: true } },
      },
    }),
    // Students.departmentId is optional, so some students in scope may have no department
    prismaClient.students.count({
      where: { ...scopeFilter, departmentId: null },
    }),
  ]);

  const result: StudentsByDepartment[] = departments.map((department) => ({
    departmentId: department.id,
    name: department.name,
    studentCount: department._count.students,
  }));

  if (unassignedCount > 0) {
    result.push({ departmentId: 'unassigned', name: null, studentCount: unassignedCount });
  }

  return result;
}
