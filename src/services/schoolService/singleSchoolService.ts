import { findUniqueSchool } from '../dbServices/dbServices.js';
import { ReturnResponse } from '../../types/definitions.js';

export const schoolDetails = async (schoolIds: string[]): Promise<ReturnResponse> => {
  const id = schoolIds[0];
  const schools = await findUniqueSchool('schools', 'id', id as string, {
    staffs: true,
    students: true,
  });
  if (schools) {
    const response = { success: true, message: 'School details fetched', data: schools };
    return response;
  }
  return { success: false, message: 'Unable to fetch group schools.' };
};
