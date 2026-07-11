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
  whereValue: string[];
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
