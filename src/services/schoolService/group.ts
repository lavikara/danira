import { findMany, findUniqueSchool } from '../dbServices/dbServices.js';
import { FindMany, ReturnResponse } from '../../types/definitions.js';

export const groupSchools = async (schoolIds: []): Promise<ReturnResponse> => {
  const query: FindMany = {
    table: 'schools',
    where: 'id',
    whereValue: schoolIds,
    include: { staffs: true, students: true },
  };
  const schools = await findMany(query);
  if (schools) {
    const response = { success: true, message: 'All group schools fetched', data: schools };
    return response;
  }
  return { success: false, message: 'Unable to fetch group schools.' };
};

export const groupDetails = async (groupId: string): Promise<ReturnResponse> => {
  const details = await findUniqueSchool('schoolGroups', 'id', groupId);
  if (details) {
    const response = { success: true, message: 'Group details fetched', data: details };
    return response;
  }
  return { success: false, message: 'Unable to fetch group schools.' };
};
