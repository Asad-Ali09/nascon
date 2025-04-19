import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const verificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 digits"),
});

const signUpSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string(),
    username: z
      .string()
      .min(3, { message: "Username must be at least 3 characters" }), // Add username validation
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const loginFormSchema = loginSchema;
export const verificationFormSchema = verificationSchema;
export const signUpFormSchema = signUpSchema;
