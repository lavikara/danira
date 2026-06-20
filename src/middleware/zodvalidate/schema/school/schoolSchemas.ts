import { z } from "zod";
import {
  SchoolType,
  SchoolSetup,
  SchoolStatus,
  Role,
  UserCondition,
} from "../../../../generated/enums.js";
import { Gender } from "../../../../generated/enums.js";

const schoolDataSchema = z.object({
  type: z.enum(SchoolType),
  setup: z.enum(SchoolSetup),
  email: z.email("Invalid school email address"),
  schoolName: z.string().min(3, "School name is too short"),
  address: z.string(),
  phoneNumber: z.string(),
  isApproved: z.boolean(),
  status: z.enum(SchoolStatus),
});

const adminDataSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.email("Invalid admin email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string(),
  address: z.string(),
  isVerified: z.boolean(),
  role: z.enum(Role),
  gender: z.enum(Gender),
  status: z.enum(UserCondition),
});

export const signupSingleSchoolSchema = z.object({
  schoolData: schoolDataSchema,
  adminData: adminDataSchema,
});

// Infer the type for application-wide type safety
export type SignupSingleSchoolInput = z.infer<typeof signupSingleSchoolSchema>;
