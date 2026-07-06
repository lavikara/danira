import { z } from 'zod';
import { userDataSchema } from '../user/userSchema.js';
import { SchoolType, SchoolSetup, SchoolStatus } from '../../../../generated/enums.js';

const schoolDataSchema = z
  .object({
    type: z.enum(SchoolType),
    setup: z.enum(SchoolSetup),
    email: z.email('Invalid school email address'),
    schoolName: z.string().trim().min(3, 'School name is too short'),
    country: z.string().trim().min(3, 'This field cannot be empty.'),
    state: z.string().trim().min(3, 'This field cannot be empty.'),
    termsConditions: z.boolean(),
    address: z.string().trim().min(3, 'This field cannot be empty.'),
    phoneNumber: z.string().trim().min(3, 'This field cannot be empty.'),
  })
  .strict();

const groupDataSchema = z
  .object({
    groupName: z.string().min(3, 'Group name is too short').nullable(),
  })
  .strict();

export const approveOrInvalidateSchoolSchema = z
  .object({
    schoolId: z.string(),
    groupId: z.string().nullable(),
    isApproved: z.boolean(),
  })
  .strict();

export const signupSchoolSchema = z
  .object({
    schoolData: schoolDataSchema,
    groupData: groupDataSchema,
    adminData: userDataSchema,
  })
  .strict();

// Infer the type for application-wide type safety
export type ApproveOrInvalidateSchoolInput = z.infer<typeof approveOrInvalidateSchoolSchema>;
export type SchoolDataInput = z.infer<typeof schoolDataSchema>;
export type GroupDataInput = z.infer<typeof groupDataSchema>;
export type SignupSchoolInput = z.infer<typeof signupSchoolSchema>;
