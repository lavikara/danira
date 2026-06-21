import { prismaClient } from "../../utils/prismaClient.js";
import { Admins, Users } from "../../generated/browser.js";

export const queryAdminsTableById = async (
  userId: string,
): Promise<{ admin: Admins; user: Users } | null> => {
  const adminWithUser = await prismaClient.admins.findUnique({
    where: { id: userId },
    include: {
      users: true,
    },
  });

  if (!adminWithUser) {
    return null;
  }

  const { users, ...admin } = adminWithUser;
  return { admin: admin as Admins, user: users };
};

// export const queryAdminByEmail = async (
//   email: string,
// ): Promise<Admins | null> => {
//   return await prismaClient.admins.findUnique({ where: { email } });
// };

// export const findUniqueAdmin = async (data: Admins): Promise<Admins | null> => {
//   return await prismaClient.admins.findFirst({
//     where: {
//       OR: [{ email: data.email }, { schoolsId: data.schoolsId }],
//     },
//   });
// };

// export const createSchoolAdmin = async (
//   data: Admins,
// ): Promise<Admins | null> => {
//   return await prismaClient.admins.create({ data });
// };
