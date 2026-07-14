import { findUniqueSchool } from '../dbServices/dbServices.js';
import { ReturnResponse } from '../../types/definitions.js';

export const groupDetails = async (groupId: string): Promise<ReturnResponse> => {
  const details = await findUniqueSchool('schoolGroups', 'id', groupId, { admins: true });
  if (details) {
    const response = { success: true, message: 'Group details fetched', data: details };
    return response;
  }
  return { success: false, message: 'Unable to fetch group schools.' };
};
