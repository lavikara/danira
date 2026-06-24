import {
  Users,
  Guardians,
  Admins,
  Staffs,
  Students,
} from "../generated/browser.js";

export interface UserToRelation {
  users: Users & {
    guardians?: Guardians;
    admins?: Admins;
    staffs?: Staffs;
    students?: Students;
  };
}
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export type RelationKeys =
  | "admins"
  | "students"
  | "staffs"
  | "guardians"
  | "users";

export type RelationKeysMap = {
  [K in RelationKeys]?: string;
};

export type IncludeQuery = {
  admins?: boolean;
  students?: boolean;
  staffs?: boolean;
  guardians?: boolean;
  users?: boolean;
};

export type OmitQuery = {
  [K in
    | keyof Users
    | keyof Admins
    | keyof Staffs
    | keyof Guardians
    | keyof Students]?: boolean;
};

export type TableColumn = "email" | "id";
