import { type Request, type Response, type NextFunction } from 'express';
import { getSubjectAnalyticsData } from '../../services/subjectService/subjectAnalyticsService.js';
import { createSortWhitelist } from '../../middleware/pagination/pagination.js';
import { ChartJsData } from '../../types/definitions.js';
import { paginatedResource } from '../../services/dbServices/dbServices.js';
import { toChartData } from '../../utils/analytics.js';
import { Staffs } from '../../generated/browser.js';
import { PaginatedSubjectQuery } from '../../services/paginationService/paginate.js';

const CHART_BORDER_RADIUS = 7;

const SUBJECTS_SORTABLE_FIELDS = ['name', 'code', 'category'] as const;

const resolveSort = createSortWhitelist(SUBJECTS_SORTABLE_FIELDS, 'name', {
  name: (order) => ({ name: order }),
  code: (order) => ({ code: order }),
  category: (order) => ({ category: order }),
});

function parseOfferings(records: Staffs[]): string[] {
  const seenIds = new Set<string>();
  const names: string[] = [];

  for (const record of records) {
    // @ts-expect-error - Fix typescript infrence for relations
    const { id, users } = record.staff;

    if (!seenIds.has(id)) {
      seenIds.add(id);
      names.push(`${users.firstName} ${users.lastName}`);
    }
  }

  return names;
}

function parseCount(count: { offerings: number; students: number }) {
  let studentClassCount = { classes: 0, students: 0 };
  studentClassCount.classes = count.offerings;
  studentClassCount.students = count.students;
  return studentClassCount;
}

const parseAverageScore = (
  reportCards: { testScore: number; assignmentScore: number; examScore: number }[],
): number | null => {
  if (!reportCards.length) return null;

  const total = reportCards.reduce(
    (sum, rc) => sum + (rc.testScore + rc.assignmentScore + rc.examScore) / 3,
    0,
  );

  return Number((total / reportCards.length).toFixed(2));
};

export const allSingleSchoolSubject = async (req: Request, res: Response, next: NextFunction) => {
  const { schoolId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { code, name, category, department } = req.query;
  const where: Record<string, any> = {};

  if (schoolId) where.schoolId = schoolId;
  if (schoolId && name) where.name = name;
  if (schoolId && code) where.code = code;
  if (schoolId && category) where.category = category;
  if (schoolId && department) where.department = department;

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      department: {
        select: { name: true },
      },
      offerings: {
        where: { staffId: { not: null } },
        select: {
          staff: {
            select: {
              id: true,
              users: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      reportCards: {
        select: { testScore: true, assignmentScore: true, examScore: true },
      },
      _count: { select: { offerings: true, students: true } },
    },
  } satisfies PaginatedSubjectQuery;

  const result = await paginatedResource('subjects', query, 'Fetched all subjects');

  if (!result.success) {
    throw new Error('Unable to fetch students');
  }
  const data = result.data.map(({ offerings, _count, reportCards, ...subject }) => ({
    ...subject,
    subjectTeacher: parseOfferings(offerings),
    studentClassCount: parseCount(_count),
    averageScore: parseAverageScore(reportCards),
  }));
  result.data = data;

  if (result.success) {
    res.json(result);
    return;
  }
};

export const allGroupSchoolSubject = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const { page, limit, sortBy, order, search } = req.pagination;

  const { schoolId, code, name, category, department } = req.query;
  const where: Record<string, any> = {
    school: { groupId },
  };

  if (schoolId) where.schoolId = schoolId;
  if (name) where.name = name;
  if (code) where.code = code;
  if (category) where.category = category;
  if (department) where.department = department;

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { code: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const query = {
    where,
    page,
    limit,
    orderBy: resolveSort(sortBy, order),
    include: {
      department: {
        select: { name: true },
      },
      offerings: {
        where: { staffId: { not: null } },
        select: {
          staff: {
            select: {
              id: true,
              users: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
      reportCards: {
        select: { testScore: true, assignmentScore: true, examScore: true },
      },
      _count: { select: { offerings: true, students: true } },
    },
  } satisfies PaginatedSubjectQuery;

  const result = await paginatedResource('subjects', query, 'Fetched all subjects');

  if (!result.success) {
    throw new Error('Unable to fetch students');
  }

  const data = result.data.map(({ offerings, _count, reportCards, ...subject }) => ({
    ...subject,
    subjectTeacher: parseOfferings(offerings),
    studentClassCount: parseCount(_count),
    averageScore: parseAverageScore(reportCards),
  }));
  result.data = data;

  if (result.success) {
    res.json(result);
    return;
  }
};

export const singleSchoolSubjectAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { schoolId } = req.params;

  const subjectWhere: Record<string, any> = {};
  if (schoolId) subjectWhere.schoolId = schoolId;

  const {
    totalSubjects,
    coreSubjects,
    electiveSubjects,
    mixedSubjects,
    topSubjectsByStudents,
    subjectsByDepartment,
  } = await getSubjectAnalyticsData(subjectWhere);

  const subjectChartItems = topSubjectsByStudents.map((subject) => ({
    label: subject.code,
    value: subject.students,
  }));

  const subjectByStudentChart: ChartJsData = toChartData(
    subjectChartItems,
    'Student',
    CHART_BORDER_RADIUS,
  );

  const departmentChartItems = subjectsByDepartment.map((dept) => ({
    label: dept.departmentName,
    value: dept.count,
  }));

  const subjectByDepartmentChart: ChartJsData = toChartData(
    departmentChartItems,
    'Subjects',
    CHART_BORDER_RADIUS,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalSubjects,
    coreSubjects,
    electiveSubjects,
    mixedSubjects,
    subjectByStudentChart: { chart: subjectByStudentChart },
    subjectByDepartmentChart: { chart: subjectByDepartmentChart },
    timestamp,
    success: true,
    message: 'subjects analytics fetched.',
  });
};

export const groupSubjectAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  const { groupId } = req.params;
  const subjectWhere: Record<string, any> = {};
  if (groupId) subjectWhere.school = { groupId };

  const {
    totalSubjects,
    coreSubjects,
    electiveSubjects,
    mixedSubjects,
    topSubjectsByStudents,
    subjectsByDepartment,
  } = await getSubjectAnalyticsData(subjectWhere);

  const subjectChartItems = topSubjectsByStudents.map((subject) => ({
    label: subject.code,
    value: subject.students,
  }));

  const subjectByStudentChart: ChartJsData = toChartData(
    subjectChartItems,
    'Students',
    CHART_BORDER_RADIUS,
  );

  const departmentChartItems = subjectsByDepartment.map((dept) => ({
    label: dept.departmentName,
    value: dept.count,
  }));

  const subjectByDepartmentChart: ChartJsData = toChartData(
    departmentChartItems,
    'Subjects',
    CHART_BORDER_RADIUS,
  );

  const timestamp = new Date().toISOString();

  res.json({
    totalSubjects,
    coreSubjects,
    electiveSubjects,
    mixedSubjects,
    subjectByStudentChart: { chart: subjectByStudentChart },
    subjectByDepartmentChart: { chart: subjectByDepartmentChart },
    timestamp,
    success: true,
    message: 'subjects analytics fetched.',
  });
};
