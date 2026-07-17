import { prismaClient } from './dbClient/prismaClient.js';
import { paginate } from '../../utils/paginate.js';
import {
  RelationKeys,
  IncludeQuery,
  OmitQuery,
  payloadType,
  AdminToUser,
  FindFirst,
  FindMany,
  PaginatedDbQuery,
  TableColumn,
  UserToRelation,
  UniqueSchoolData,
} from '../../types/definitions.js';

export const paginatedResource = async (
  table: RelationKeys,
  query: PaginatedDbQuery,
  message: string,
) => {
  return await paginate(prismaClient[table], query, message);
};

export const findUniqueUser = async (
  table: RelationKeys,
  where: TableColumn,
  whereValue: string,
  include?: IncludeQuery,
  omit?: OmitQuery,
): Promise<(UserToRelation & AdminToUser) | null> => {
  const user = await prismaClient[table].findUnique({
    where: { [where]: whereValue } as any,
    include: include as IncludeQuery,
    omit: omit as OmitQuery,
  });
  if (!user) return null;
  // remove null relation fields for specific relation keys
  const relationKeysToClean: RelationKeys[] = ['admins', 'students', 'staffs', 'guardians'];
  for (const relKey of relationKeysToClean) {
    if (relKey in user && (user as any)[relKey] === null) {
      delete (user as any)[relKey];
    }
  }
  return { [table]: user } as unknown as (UserToRelation & AdminToUser) | null;
};

export const findUniqueSchool = async (
  table: RelationKeys,
  where: TableColumn,
  whereValue: string,
  include?: IncludeQuery,
  omit?: OmitQuery,
): Promise<UniqueSchoolData | null> => {
  const unique = await prismaClient[table].findUnique({
    where: { [where]: whereValue } as any,
    include: include as IncludeQuery,
    omit: omit as OmitQuery,
  });
  if (!unique) return null;

  return { [table]: unique } as unknown as UniqueSchoolData | null;
};

export const findFirst = async (query: FindFirst) => {
  if (!query.column || query.column.length === 0) return null;

  const whereClause = query.column.length === 1 ? query.column[0] : { OR: query.column };

  return await prismaClient[query.table].findFirst({
    where: whereClause as any,
  });
};

export const findMany = async (query: FindMany) => {
  return await prismaClient[query.table].findMany({
    where: { [query.where]: { in: query.whereArray } },
    include: query.include as IncludeQuery,
  });
};

export const createWithTransaction = async (tx: any, table: RelationKeys, data: payloadType) => {
  return await tx[table].create({
    data,
  });
};

export const updateWithTransaction = async (tx: any, table: RelationKeys, data: payloadType) => {
  return await tx[table].update({
    ...data,
  });
};
