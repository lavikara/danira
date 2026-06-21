import { prismaClient } from "../../utils/prismaClient.js";
import { SignupSchoolInput } from "../../middleware/zodvalidate/schema/school/schoolSchemas.js";
import { Schools, Users, Admins } from "../../generated/browser.js";

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
 *    Check if school name or schoole email already exist
 */
export const querySchoolTableByEmailAndSchoolName = async (
  data: Schools,
): Promise<Schools | null> => {
  return await prismaClient.schools.findFirst({
    where: { OR: [{ email: data.email }, { schoolName: data.schoolName }] },
  });
};
