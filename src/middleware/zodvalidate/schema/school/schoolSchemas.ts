import { z } from 'zod';
import { userDataSchema } from '../user/userSchema.js';
import { SchoolType, SchoolSetup, SchoolStatus } from '../../../../generated/enums.js';

const schoolDataSchema = z.object({
  type: z.enum(SchoolType),
  setup: z.enum(SchoolSetup),
  email: z.email('Invalid school email address'),
  schoolName: z.string().min(3, 'School name is too short'),
  address: z.string(),
  phoneNumber: z.string(),
  isApproved: z.boolean(),
  status: z.enum(SchoolStatus),
});

const groupDataSchema = z.object({
  groupName: z.string().min(3, 'Group name is too short').nullable(),
  status: z.enum(SchoolStatus).nullable(),
});

export const approveOrInvalidateSchoolSchema = z.object({
  schoolId: z.string(),
  groupId: z.string().nullable(),
  isApproved: z.boolean(),
});

export const signupSchoolSchema = z.object({
  schoolData: schoolDataSchema,
  groupData: groupDataSchema,
  adminData: userDataSchema,
});

// Infer the type for application-wide type safety
export type ApproveOrInvalidateSchoolInput = z.infer<typeof approveOrInvalidateSchoolSchema>;
export type SchoolDataInput = z.infer<typeof schoolDataSchema>;
export type GroupDataInput = z.infer<typeof groupDataSchema>;
export type SignupSchoolInput = z.infer<typeof signupSchoolSchema>;
