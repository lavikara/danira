export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  timestamp: string;
}

export type RelationKeys = "admins" | "students" | "staffs" | "guardians";

export type RelationKeysMap = {
  [K in RelationKeys]?: string;
};

export interface UserQueryOptions {
  omitPassword?: boolean;
  admins?: boolean;
  students?: boolean;
  staffs?: boolean;
  guardians?: boolean;
}
