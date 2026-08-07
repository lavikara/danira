import { findFirst } from '../dbServices/dbServices.js';
import { ReturnResponse, RelationKeys } from '../../types/definitions.js';

export const queryTimetableById = async (
  timetableId: string,
  schoolId: string,
): Promise<ReturnResponse> => {
  const query = {
    table: 'timetables' as RelationKeys,
    column: [{ id: timetableId, schoolId }],
    include: {
      periods: {
        select: {
          id: true,
          name: true,
          day: true,
          startTime: true,
          endTime: true,
          periodType: true,
          lesson: {
            select: {
              id: true,
              name: true,
              day: true,
              status: true,
              startTime: true,
              endTime: true,
              subject: {
                select: { id: true, name: true, code: true, category: true },
              },
              staff: {
                select: {
                  id: true,
                  position: true,
                  users: {
                    select: { firstName: true, lastName: true, email: true },
                  },
                },
              },
              classInfo: {
                select: { id: true, name: true },
              },
            },
          },
        },
      },
      classInfo: true,
      gradeYear: true,
      term: true,
    },
  };
  const timetable = await findFirst(query);
  if (timetable) {
    const response = { success: true, message: 'Timetable details fetched', data: timetable };
    return response;
  }
  return { success: false, message: 'Unable to fetch timetable.' };
};
