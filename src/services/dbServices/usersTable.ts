import { prismaClient } from "./dbClient/prismaClient.js";
import { Users } from "../../generated/browser.js";
import { UserQueryOptions } from "../../types/definitions.js";
import { queryAdminsTableById } from "./adminTable.js";

/**
 *    Database query of user table by email
 */
export const queryUsersTableByEmail = async (
  email: string,
  omitPassword: boolean,
): Promise<Omit<Users, "password"> | null> => {
  return await prismaClient.users.findUnique({
    where: { email },
    include: {
      admins: true,
      students: true,
      staffs: true,
      guardians: true,
    },
    omit: {
      password: omitPassword ? true : false,
    },
  });
};

/**
 *    Database query to update user password
 */
export const updateUserPassword = async (
  id: string,
  password: string,
  queryOptions: UserQueryOptions,
): Promise<Omit<Users, "password"> | null> => {
  return await prismaClient.users.update({
    where: { id },
    data: { password, isVerified: true },
    omit: {
      password: queryOptions.omitPassword ? true : false,
    },
  });
};

export const queryUserByRoleId = async (key: string, userId: string) => {
  let user;
  switch (key) {
    case "admins":
      user = await queryAdminsTableById(userId);
      break;
    case "students":
      // user = await queryStudentsTableById(userId);
      break;
    case "staffs":
      // user = await queryStaffsTableById(userId);
      break;
    case "guardians":
      // user = await queryGuardiansTableById(userId);
      break;

    default:
      break;
  }
  return user;
};
