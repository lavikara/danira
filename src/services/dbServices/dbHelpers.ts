import { prismaClient } from "./dbClient/prismaClient.js";
import {
  RelationKeys,
  IncludeQuery,
  OmitQuery,
  TableColumn,
  UserToRelation,
} from "../../types/definitions.js";

export const findUnique = async (
  table: RelationKeys,
  where: TableColumn,
  whereValue: string,
  include: IncludeQuery,
  omit?: OmitQuery,
): Promise<UserToRelation | null> => {
  const user = await prismaClient[table].findUnique({
    where: { [where]: whereValue } as any,
    include: include as any,
    omit: omit as any,
  });
  if (!user) return null;
  // remove null relation fields for specific relation keys
  const relationKeysToClean: RelationKeys[] = [
    "admins",
    "students",
    "staffs",
    "guardians",
  ];
  for (const relKey of relationKeysToClean) {
    if (relKey in user && (user as any)[relKey] === null) {
      delete (user as any)[relKey];
    }
  }
  return { [table]: user } as unknown as UserToRelation | null;
};
