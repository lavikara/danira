import { prismaClient } from '../dbServices/dbClient/prismaClient.js';

export interface TopClassByPopulation {
  classId: string;
  name: string;
  population: number;
}

export interface ClassAnalyticsResult {
  totalClasses: number;
  averageClassSize: number;
  averagePerformance: number;
  averageAttendance: number;
  topClassesByPopulation: TopClassByPopulation[];
}

export async function getClassAnalyticsData(
  classWhere: Record<string, any>,
): Promise<ClassAnalyticsResult> {
  const studentClassFilter = { class: classWhere };

  const [
    totalClasses,
    classSizeAgg,
    reportCardAgg,
    totalAttendanceCount,
    presentAttendanceCount,
    topClassesByPopulation,
  ] = await Promise.all([
    prismaClient.classes.count({ where: classWhere }),
    prismaClient.classes.aggregate({
      where: classWhere,
      _avg: { population: true },
    }),
    prismaClient.reportCards.aggregate({
      where: { student: studentClassFilter },
      _avg: { testScore: true, assignmentScore: true, examScore: true },
    }),
    prismaClient.attendance.count({ where: { student: studentClassFilter } }),
    prismaClient.attendance.count({
      where: { student: studentClassFilter, attendance: 'PRESENT' },
    }),
    prismaClient.classes.findMany({
      where: classWhere,
      orderBy: { population: 'desc' },
      take: 20,
      select: { id: true, name: true, population: true },
    }),
  ]);

  // Performance = average of test/assignment/exam scores across report cards
  // for students in scope. attendanceScore on ReportCards is left out here
  // since we compute a real attendance figure from the Attendance model below.
  const { testScore, assignmentScore, examScore } = reportCardAgg._avg;
  const performanceComponents = [testScore, assignmentScore, examScore].filter(
    (score): score is number => score !== null,
  );
  const averagePerformance =
    performanceComponents.length > 0
      ? performanceComponents.reduce((sum, score) => sum + score, 0) / performanceComponents.length
      : 0;

  const averageAttendance =
    totalAttendanceCount > 0 ? (presentAttendanceCount / totalAttendanceCount) * 100 : 0;

  return {
    totalClasses,
    averageClassSize: classSizeAgg._avg.population ?? 0,
    averagePerformance,
    averageAttendance,
    topClassesByPopulation: topClassesByPopulation.map((classItem) => ({
      classId: classItem.id,
      name: classItem.name,
      population: classItem.population,
    })),
  };
}
