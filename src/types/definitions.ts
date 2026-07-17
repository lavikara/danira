import {
  Users,
  Guardians,
  Admins,
  Staffs,
  SchoolSetup,
  Students,
  SchoolStatus,
  Schools,
  SchoolGroups,
  Role,
} from '../generated/browser.js';
import {
  SchoolDataInput,
  GroupDataInput,
} from '../middleware/zodvalidate/schema/school/schoolSchemas.js';
import { UserDataInput } from '../middleware/zodvalidate/schema/user/userSchema.js';

export interface UserToRelation {
  users: Users & {
    guardians?: Guardians;
    admins?: Admins;
    staffs?: Staffs;
    students?: Students;
    schools?: Schools;
  };
}

export interface AdminToUser {
  admins: Admins & {
    users?: Users;
  };
}

export interface UniqueSchoolData {
  schools: Schools;
  schoolGroups?: SchoolGroups;
  users?: Users;
  admins?: Admins;
}

export interface SchoolAdminData {
  userId: string;
  schoolIds: string[];
  schools: {
    connect: {
      id: string;
    };
  };
  type: SchoolSetup;
}

export interface GroupData {
  groupName: string | null;
  status: 'BLOCKED' | 'ACTIVE' | 'PENDING' | 'APPROVED' | 'REJECTED' | null;
}

export interface SchoolUpdateData {
  where: { id: any };
  data: {
    admins?: { connect: { id: string } };
    schools?: { connect: { id: string } };
    groupId?: { connect: { id: string } };
    status?: string;
  };
}

export type payloadType =
  | SchoolDataInput
  | UserDataInput
  | SchoolAdminData
  | GroupData
  | SchoolUpdateData
  | null;
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export type RelationKeys =
  | 'admins'
  | 'students'
  | 'staffs'
  | 'guardians'
  | 'users'
  | 'schools'
  | 'schoolGroups';

export type RelationKeysMap = {
  [K in RelationKeys]?: string;
};

export type IncludeQuery = {
  admins?: boolean;
  students?: boolean;
  staffs?: boolean;
  guardians?: boolean;
  users?: boolean;
  schools?: boolean;
};

export type OmitQuery = {
  [K in keyof Users | keyof Admins | keyof Staffs | keyof Guardians | keyof Students]?: boolean;
};

export type TableColumn = 'email' | 'id' | 'schoolName' | 'groupName';

export type TableColumnObject = {
  [K in TableColumn]?: string;
};

export interface FindFirst {
  table: RelationKeys;
  column: TableColumnObject[];
}

export interface FindMany {
  table: RelationKeys;
  where: TableColumn;
  whereArray: string[];
  include?: IncludeQuery;
}

export interface ReturnResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

type SchoolDataInputWithStatus = SchoolDataInput & {
  isApproved: boolean;
  status: SchoolStatus;
};

type GroupDataInputWithStatus = GroupDataInput & {
  status: SchoolStatus;
};

type AdminDataInputWithStatus = UserDataInput & {
  isVerified: boolean;
  status: SchoolStatus;
  role: Role;
};

export interface SignupPayload {
  schoolData: SchoolDataInputWithStatus;
  groupData: GroupDataInputWithStatus;
  adminData: AdminDataInputWithStatus;
}

interface BarChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderRadius?: number;
}

export interface ChartJsBarData {
  labels: string[];
  datasets: BarChartDataset[];
}

export interface PaginationQuery {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string | undefined;
  order: 'asc' | 'desc';
  search?: string | undefined;
}

export interface PaginatedDbQuery {
  where: Record<string, any>;
  page: number;
  limit: number;
  orderBy: Record<string, any>;
  include?: {
    users?: { omit: { password: boolean } };
    school?: boolean;
    department?: { select: { name: boolean } };
    headOfDepartment?: boolean;
  };
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
  timestamp: string;
  message: string;
}

export interface Paginatable<T> {
  findMany: (args: any) => Promise<T[]>;
  count: (args: any) => Promise<number>;
}

export interface PaginateOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[];
  select?: Record<string, any>;
  include?: Record<string, any>;
  page: number;
  limit: number;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userKey?: RelationKeys;
      userRole?: string;
      groupId?: string;
      schoolIds?: string[];
      pagination: PaginationQuery;
    }
  }
}
