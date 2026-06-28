import { z } from 'zod';
import { Role, UserCondition, Gender } from '../../../../generated/enums.js';

export const userDataSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid admin email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string(),
  address: z.string(),
  isVerified: z.boolean(),
  role: z.enum(Role),
  gender: z.enum(Gender),
  status: z.enum(UserCondition),
});

export type UserDataInput = z.infer<typeof userDataSchema>;
