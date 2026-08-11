import { prismaClient } from '../dbServices/dbClient/prismaClient.js';
import { generateRandomString } from '../../utils/helpers.js';
import { Schools, Users, Admins } from '../../generated/browser.js';
import { hash } from '../bcryptService/bcryptService.js';
import {
  findFirst,
  findUniqueSchool,
  createWithTransaction,
  updateWithTransaction,
} from '../dbServices/dbServices.js';
import {
  RelationKeys,
  ReturnResponse,
  SchoolAdminData,
  SchoolUpdateData,
  SignupPayload,
} from '../../types/definitions.js';

const checkSignupPayload = (data: SignupPayload, userId: string | undefined): ReturnResponse => {
  if (!userId) {
    if (data.schoolData.isApproved || data.schoolData.status !== 'PENDING') {
      const error = { success: false, message: 'Invalid fields.' };
      return error;
    }
  }

  if (data.adminData.isVerified || data.adminData.status !== 'PENDING') {
    const error = { success: false, message: 'Invalid fields.' };
    return error;
  }

  if (data.schoolData.email !== data.adminData.email) {
    const error = { success: false, message: 'Admin must use school email.' };
    return error;
  }

  if (data.schoolData.setup === 'GROUP' && data.groupData.status !== 'PENDING') {
    const error = {
      success: false,
      message: 'Group status must be PENDING.',
    };
    return error;
  }

  if (data.schoolData.setup === 'GROUP' && data.adminData.role !== 'GROUPSCHOOLADMIN') {
    const error = {
      success: false,
      message: 'Role for group school admin must be GROUPSCHOOLADMIN.',
    };
    return error;
  }

  if (data.schoolData.setup === 'SINGLE' && data.adminData.role !== 'SCHOOLADMIN') {
    const error = {
      success: false,
      message: 'Role for single school admin must be SCHOOLADMIN.',
    };
    return error;
  }
  return { success: true, message: 'Valid payload.' };
};

/**
 * Create a school that belongs to a group, with its initial admin and user.
 *
 * This function performs a database transaction that:
 * - creates a school group using data.groupData
 * - creates a school using data.schoolData
 * - creates a user for the school's admin using data.adminData
 * - creates an admin record linking the user and the school
 * - updates the school group to include the new admin and school
 * - updates the school to set its groupId and include the admin relation
 *
 * All operations are executed inside a single transaction for atomicity.
 *
 * @param data - SignupSchoolInput containing groupData, schoolData and adminData
 * @returns An object containing the created/updated school, user and admin
 */
const signupSchool = async (
  data: SignupPayload,
  userId: string | undefined,
  userRole: string | undefined,
): Promise<{ school: Schools; user: Users; admin: Admins }> => {
  const result = await prismaClient.$transaction(async (tx) => {
    const group =
      data.schoolData.setup === 'GROUP'
        ? await createWithTransaction(tx as any, 'schoolGroups', data.groupData)
        : null;
    const school = await createWithTransaction(tx as any, 'schools', data.schoolData);
    const user = await createWithTransaction(tx as any, 'users', data.adminData);
    const schoolAdminData: SchoolAdminData = {
      userId: user.id,
      schoolIds: [(school as any).id],
      school: { connect: { id: (school as any).id } },
      type: (school as any).setup,
    };
    const admin = await createWithTransaction(tx as any, 'admins', schoolAdminData);

    const updateSchoolGroupData: SchoolUpdateData | null =
      data.schoolData.setup === 'GROUP'
        ? {
            where: { id: (group as any).id },
            data: {
              admins: { connect: { id: (admin as any).id } },
              school: { connect: { id: (school as any).id } },
              status: userRole === 'SUPERADMIN' ? 'APPROVED' : 'PENDING',
            },
          }
        : null;

    data.schoolData.setup === 'GROUP'
      ? await updateWithTransaction(tx as any, 'schoolGroups', updateSchoolGroupData)
      : null;
    const updatedSchoolData = {
      where: { id: (school as any).id },
      data: {
        admins: { connect: { id: (admin as any).id } },
        groupId: data.schoolData.setup === 'GROUP' ? (group as any).id : null,
        approvedBy: userRole === 'SUPERADMIN' ? userId : null,
        status: userRole === 'SUPERADMIN' ? 'APPROVED' : 'PENDING',
        createdBy: userId ? userId : user.id,
      },
    };
    const updatedSchool = await updateWithTransaction(tx as any, 'schools', updatedSchoolData);

    return { school: updatedSchool, user, admin };
  });

  return result as any;
};

export const userSchoolSignup = async (
  data: SignupPayload,
  userId?: string,
  userRole?: string,
): Promise<ReturnResponse> => {
  const payloadValid = checkSignupPayload(data, userId);

  if (payloadValid.success === false) {
    return payloadValid;
  }

  const randomPassword = generateRandomString();
  const defaultPassword = await hash(randomPassword);
  const adminData = data.adminData as typeof data.adminData & { password: string };

  adminData.password = defaultPassword;

  const query = {
    table: 'schools' as RelationKeys,
    column: [{ email: data.schoolData.email }, { schoolName: data.schoolData.schoolName }],
  };

  const schoolAlreadyExist = await findFirst(query);
  if (data.groupData.groupName) {
    const groupAlreadyExist = await findUniqueSchool(
      'schoolGroups',
      'groupName',
      data.groupData.groupName,
    );
    if (groupAlreadyExist) {
      const error = { success: false, message: 'Conflicting records.' };
      return error;
    }
  }

  if (schoolAlreadyExist) {
    const error = { success: false, message: 'Conflicting records.' };
    return error;
  }

  if (!schoolAlreadyExist) {
    const created = await signupSchool(data, userId, userRole);
    if (created) {
      const response = { success: true, message: 'School Created', data: created };
      return response;
    }
  }

  return { success: false, message: 'Unable to create school.' };
};

export const daniraSchoolSignup = async (
  data: SignupPayload,
  userId?: string,
  userRole?: string,
): Promise<ReturnResponse> => {
  const payloadValid = checkSignupPayload(data, userId);

  if (payloadValid.success === false) {
    return payloadValid;
  }

  const randomPassword = generateRandomString();
  const defaultPassword = await hash(randomPassword);
  const adminData = data.adminData as typeof data.adminData & { password: string };

  adminData.password = defaultPassword;

  const query = {
    table: 'schools' as RelationKeys,
    column: [{ email: data.schoolData.email }, { schoolName: data.schoolData.schoolName }],
  };

  const schoolAlreadyExist = await findFirst(query);
  if (data.groupData.groupName) {
    const groupAlreadyExist = await findUniqueSchool(
      'schoolGroups',
      'groupName',
      data.groupData.groupName,
    );
    if (groupAlreadyExist) {
      const error = { success: false, message: 'Conflicting records.' };
      return error;
    }
  }

  if (schoolAlreadyExist) {
    const error = { success: false, message: 'Conflicting records.' };
    return error;
  }

  if (!schoolAlreadyExist) {
    const created = await signupSchool(data, userId, userRole);
    if (created) {
      const response = { success: true, message: 'School Created', data: created };
      return response;
    }
  }

  return { success: false, message: 'Unable to create school.' };
};
