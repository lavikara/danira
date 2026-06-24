import { prismaClient } from "./dbClient/prismaClient.js";
import { Users } from "../../generated/browser.js";
import { queryAdminsTableById } from "./adminTable.js";
import { UserToRelation } from "../../types/definitions.js";

/**
 *    Database query to update user password
 */
const getRelationAndUserId = (user: UserToRelation, relationKey: string) => {
  const anyUser = user as any;
  const relation = anyUser?.[relationKey];
  const userId = relation?.users?.id;

  if (!userId)
    throw new Error("Unable to determine user id for password update");

  return { relation, userId };
};

const updatePasswordRecord = async (
  tx: any,
  userId: string,
  relationKey: string,
  password: string,
) => {
  return tx.users.update({
    where: { id: userId },
    include: {
      [relationKey]: true,
    },
    data: { password, isVerified: true, status: "ACTIVE" },
    omit: { password: true },
  });
};

const activateRelatedEntities = async (tx: any, relation: any) => {
  const role = relation.users.role;

  if (role === "GROUPSCHOOLADMIN") {
    await tx.schools.updateMany({
      where: { id: { in: relation.schoolIds } },
      data: { status: "ACTIVE" },
    });
    await tx.schoolGroups.update({
      where: { id: relation.groupId },
      data: { status: "ACTIVE" },
    });
    return;
  }

  if (role === "SUBSCHOOLADMIN" || role === "SCHOOLADMIN") {
    await tx.schools.updateMany({
      where: { id: { in: relation.schoolIds } },
      data: { status: "ACTIVE" },
    });
  }
};

export const updateUserPassword = async (
  user: UserToRelation,
  password: string,
  relationKey: string,
): Promise<Omit<UserToRelation, "password"> | null> => {
  const result = await prismaClient.$transaction(async (tx) => {
    const { relation, userId } = getRelationAndUserId(user, relationKey);
    const updated = await updatePasswordRecord(tx as any, userId, relationKey, password);
    await activateRelatedEntities(tx as any, relation);
    return updated;
  });
  return result as UserToRelation;
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
