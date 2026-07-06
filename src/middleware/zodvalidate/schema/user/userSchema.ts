import { z } from 'zod';
import { Role, UserCondition, Gender } from '../../../../generated/enums.js';

export const userDataSchema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email('Invalid admin email address'),
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    phoneNumber: z.string().trim().min(3, 'This field cannot be empty.'),
    country: z.string().trim().min(3, 'This field cannot be empty.'),
    state: z.string().trim().min(3, 'This field cannot be empty.'),
    address: z.string().trim().min(3, 'This field cannot be empty.'),
    gender: z.enum(Gender),
  })
  .strict();

export type UserDataInput = z.infer<typeof userDataSchema>;
