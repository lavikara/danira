import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { ApproveOrInvalidateSchoolInput } from '../../middleware/zodvalidate/schema/school/schoolSchemas.js';
import { ReturnResponse } from '../../types/definitions.js';
import { findUniqueSchool, findUniqueUser } from '../dbServices/dbServices.js';

export const approveSchoolService = async (
  data: ApproveOrInvalidateSchoolInput,
  userId?: string,
): Promise<ReturnResponse> => {
  const findSchool = await findUniqueSchool('schools', 'id', data.schoolId);
  if (!findSchool) {
    const error = { success: false, message: 'School unavailable.' };
    return error;
  }
  const schoolEmail = findSchool.schools?.email;
  if (!schoolEmail) {
    const error = { success: false, message: 'School admin email unavailable.' };
    return error;
  }
  const users = await findUniqueUser(
    'users',
    'email',
    schoolEmail,
    { admins: true, students: true, staffs: true, guardians: true },
    { password: true },
  );
  const findSchoolGroup = data.groupId
    ? await findUniqueSchool('schoolGroups', 'id', data.groupId)
    : null;

  if (!findSchoolGroup) {
    const error = { success: false, message: 'Group unavailable.' };
    return error;
  }
  let schoolData: any = {
    approvedBy: userId,
    isApproved: data.isApproved,
    status: data.isApproved ? 'APPROVED' : 'PENDING',
  };
  let schoolGroupData: any = {
    status: data.isApproved ? 'APPROVED' : 'PENDING',
  };

  if (data.groupId) {
    const [schools, schoolGroups] = await prismaClient.$transaction([
      prismaClient.schools.update({
        where: { id: data.schoolId },
        data: schoolData,
      }),
      prismaClient.schoolGroups.update({
        where: { id: data.groupId },
        data: schoolGroupData,
      }),
    ]);
    return {
      success: true,
      message: 'School approved.',
      data: { schools, schoolGroups, ...users },
    };
  }

  if (!data.groupId) {
    const [schools] = await prismaClient.$transaction([
      prismaClient.schools.update({
        where: { id: data.schoolId },
        data: schoolData,
      }),
    ]);
    return {
      success: true,
      message: 'School approved.',
      data: { schools, ...users },
    };
  }
  return { success: false, message: 'Unable to approve school.' };
};
