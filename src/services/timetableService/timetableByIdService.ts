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
      periods: true,
      class: true,
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
