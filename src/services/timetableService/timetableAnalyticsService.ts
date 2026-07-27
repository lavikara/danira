import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { Prisma } from '../../generated/client.js';

export interface TimetableAnalyticsResult {
  totalLessons: number;
  totalPeriod: number;
}

export async function getTimetableAnalyticsData(
  timetableWhere: Prisma.TimetablesWhereInput,
): Promise<TimetableAnalyticsResult> {
  const timetables = await prismaClient.timetables.findMany({
    where: timetableWhere,
    select: {
      periods: {
        select: {
          lessonId: true,
        },
      },
    },
  });

  const lessonIds = new Set<string>();
  let totalPeriod = 0;

  for (const timetable of timetables) {
    for (const period of timetable.periods) {
      totalPeriod += 1;
      if (period.lessonId) {
        lessonIds.add(period.lessonId);
      }
    }
  }

  const totalLessons = lessonIds.size;

  return {
    totalLessons,
    totalPeriod,
  };
}
