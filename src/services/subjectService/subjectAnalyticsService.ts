import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { Prisma } from '../../generated/client.js';

export function buildSchoolSubjectScope(schoolId?: string): Record<string, any> {
  return schoolId ? { schoolId } : {};
}

export function buildGroupSubjectScope(groupId?: string): Record<string, any> {
  return groupId ? { school: { groupId } } : {};
}

export interface TopSubjectByPopulation {
  code: string;
  students: number;
}

export interface DepartmentSubjectCount {
  departmentId: string | null;
  departmentName: string;
  count: number;
}

export interface SubjectAnalyticsResult {
  totalSubjects: number;
  coreSubjects: number;
  electiveSubjects: number;
  mixedSubjects: number;
  topSubjectsByStudents: TopSubjectByPopulation[];
  subjectsByDepartment: DepartmentSubjectCount[];
}

export async function getSubjectAnalyticsData(
  subjectWhere: Prisma.SubjectsWhereInput,
): Promise<SubjectAnalyticsResult> {
  const departmentGroupsArgs = {
    by: ['departmentId'],
    where: subjectWhere,
    _count: { _all: true },
  } satisfies Prisma.SubjectsGroupByArgs;

  const [
    totalSubjects,
    coreSubjects,
    electiveSubjects,
    mixedSubjects,
    topSubjectsRaw,
    departmentGroups,
  ] = await Promise.all([
    prismaClient.subjects.count({ where: subjectWhere }),
    prismaClient.subjects.count({ where: { ...subjectWhere, category: 'CORE' } }),
    prismaClient.subjects.count({ where: { ...subjectWhere, category: 'ELECTIVE' } }),
    prismaClient.subjects.count({ where: { ...subjectWhere, category: 'CO_CURRICULAR' } }),
    prismaClient.subjects.findMany({
      where: subjectWhere,
      select: { code: true, _count: { select: { students: true } } },
    }),
    prismaClient.subjects.groupBy(departmentGroupsArgs),
  ]);

  const studentsByName = new Map<string, number>();
  for (const subject of topSubjectsRaw) {
    studentsByName.set(
      subject.code,
      (studentsByName.get(subject.code) ?? 0) + subject._count.students,
    );
  }
  const topSubjectsByStudents = Array.from(studentsByName.entries())
    .map(([code, students]) => ({ code, students }))
    .sort((a, b) => b.students - a.students)
    .slice(0, 20);

  const departmentIds = departmentGroups
    .map((group) => group.departmentId)
    .filter((id): id is string => id !== null);

  const departments = departmentIds.length
    ? await prismaClient.departments.findMany({
        where: { id: { in: departmentIds } },
        select: { id: true, name: true },
      })
    : [];
  const departmentNameById = new Map(
    departments.map((department) => [department.id, department.name]),
  );

  const subjectsByDepartment = departmentGroups
    .map((group) => ({
      departmentId: group.departmentId,
      departmentName: group.departmentId
        ? (departmentNameById.get(group.departmentId) ?? 'Unknown')
        : 'Unassigned',
      count: group._count._all,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalSubjects,
    coreSubjects,
    electiveSubjects,
    mixedSubjects,
    topSubjectsByStudents,
    subjectsByDepartment,
  };
}
