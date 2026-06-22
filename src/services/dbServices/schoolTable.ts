import { prismaClient } from "../../services/dbServices/dbClient/prismaClient.js";
import { SignupSchoolInput } from "../../middleware/zodvalidate/schema/school/schoolSchemas.js";
import { Schools, Users, Admins } from "../../generated/browser.js";

/**
 * Create a single school with its initial admin and user records.
 *
 * This function performs a database transaction that:
 * - creates a school record using data.schoolData
 * - creates a user record for the school's admin using data.adminData
 * - creates an admin record that links the user and the school
 * - updates the school to include the created admin in its relation
 *
 * All operations run inside a single transaction so that either all changes
 * succeed or none are committed.
 *
 * @param data - SignupSchoolInput containing schoolData and adminData
 * @returns An object containing the created/updated school, user and admin
 */
export const signupSingleSchool = async (
  data: SignupSchoolInput,
): Promise<{ school: Schools; user: Users; admin: Admins }> => {
  const result = await prismaClient.$transaction(async (tx) => {
    const school = await tx.schools.create({
      data: (data as any).schoolData,
    });
    const user = await tx.users.create({ data: (data as any).adminData });
    const admin = await tx.admins.create({
      data: {
        userId: user.id,
        schoolIds: [(school as any).id],
        schools: { connect: { id: (school as any).id } },
        type: (school as any).setup,
      },
    });

    const updatedSchool = await tx.schools.update({
      where: { id: (school as any).id },
      data: { admins: { connect: { id: (admin as any).id } } },
    });

    return { school: updatedSchool, user, admin };
  });

  return result as any;
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
export const signupGroupSchool = async (
  data: SignupSchoolInput,
): Promise<{ school: Schools; user: Users; admin: Admins }> => {
  const result = await prismaClient.$transaction(async (tx) => {
    const group = await tx.schoolGroups.create({
      data: (data as any).groupData,
    });
    const school = await tx.schools.create({
      data: (data as any).schoolData,
    });
    const user = await tx.users.create({ data: (data as any).adminData });
    const admin = await tx.admins.create({
      data: {
        userId: user.id,
        schoolIds: [(school as any).id],
        schools: { connect: { id: (school as any).id } },
        type: (school as any).setup,
      },
    });

    await tx.schoolGroups.update({
      where: { id: (group as any).id },
      data: {
        admins: { connect: { id: (admin as any).id } },
        schools: { connect: { id: (school as any).id } },
      },
    });

    const updatedSchool = await tx.schools.update({
      where: { id: (school as any).id },
      data: {
        admins: { connect: { id: (admin as any).id } },
        groupId: (group as any).id,
      },
    });

    return { school: updatedSchool, user, admin };
  });

  return result as any;
};

/**
 * Query the schools table to check existence by email or school name.
 *
 * Useful for validating uniqueness during signup flows.
 *
 * @param data - A Schools object with email and/or schoolName fields to check
 * @returns The first matching Schools record or null if none found
 */
export const querySchoolTableByEmailAndSchoolName = async (
  data: Schools,
): Promise<Schools | null> => {
  return await prismaClient.schools.findFirst({
    where: { OR: [{ email: data.email }, { schoolName: data.schoolName }] },
  });
};
