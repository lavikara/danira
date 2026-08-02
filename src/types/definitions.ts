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
import { PaginationQuery } from '../services/paginationService/paginate.js';

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
  | 'subjects'
  | 'classes'
  | 'timetables'
  | 'staffAttendance'
  | 'notifications'
  | 'studentAttendance'
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
  group?: boolean;
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
  include?: Record<string, any>;
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

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[] | undefined;
  borderRadius?: number;
}

export interface ChartJsData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<TRow> {
  data: TRow[];
  meta: PaginationMeta;
  timestamp: string;
  success: true;
  message: string;
}

export interface Paginatable {
  findMany: (args: any) => Promise<any>;
  count: (args: any) => Promise<number>;
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
