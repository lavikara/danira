import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.email("Provide a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters long"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string("Invalid token"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.email("Provide a valid email address"),
  }),
});

// Infer the type for application-wide type safety
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
