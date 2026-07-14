import { findUniqueSchool } from '../dbServices/dbServices.js';
import { ReturnResponse } from '../../types/definitions.js';

export const schoolDetails = async (schoolId: string): Promise<ReturnResponse> => {
  const schools = await findUniqueSchool('schools', 'id', schoolId);
  if (schools) {
    const response = { success: true, message: 'School details fetched', data: schools };
    return response;
  }
  return { success: false, message: 'Unable to fetch group schools.' };
};
