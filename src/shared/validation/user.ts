import { z } from 'zod';

// Login schema
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type LoginInput = z.infer<typeof loginSchema>;

// Signup schema
export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
});

export type SignupInput = z.infer<typeof signupSchema>;

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;

// Password reset confirmation schema
export const passwordResetConfirmSchema = z.object({
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type PasswordResetConfirmInput = z.infer<typeof passwordResetConfirmSchema>;

// Profile update schema for API
export const profileUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters').optional(),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(160, 'Bio cannot exceed 160 characters').optional(),
  location: z.string().max(100, 'Location cannot exceed 100 characters').optional().or(z.literal('')),
  website: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  twitter: z.string().max(15, 'Twitter username cannot exceed 15 characters').regex(/^[a-zA-Z0-9_]*$/, 'Twitter username can only contain letters, numbers, and underscores').optional().or(z.literal('')),
  linkedin: z.string().max(30, 'LinkedIn username cannot exceed 30 characters').regex(/^[a-zA-Z0-9-]*$/, 'LinkedIn username can only contain letters, numbers, and hyphens').optional().or(z.literal('')),
  instagram: z.string().max(30, 'Instagram username cannot exceed 30 characters').regex(/^[a-zA-Z0-9_.]*$/, 'Instagram username can only contain letters, numbers, dots, and underscores').optional().or(z.literal('')),
  youtube: z.string().max(100, 'YouTube channel name cannot exceed 100 characters').optional().or(z.literal('')),
  github: z.string().max(39, 'GitHub username cannot exceed 39 characters').regex(/^[a-zA-Z0-9-]*$/, 'GitHub username can only contain letters, numbers, and hyphens').optional().or(z.literal('')),
  avatar: z.string().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

// Helper: optional string field that accepts empty strings and null (common in form inputs)
const optionalFormString = (schema: z.ZodString) =>
  z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    schema.optional()
  );

// Profile form schema for client-side
export const profileFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: optionalFormString(
    z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name cannot exceed 50 characters')
  ),
  bio: optionalFormString(
    z.string().max(160, 'Bio cannot exceed 160 characters')
  ),
  location: optionalFormString(
    z.string().max(100, 'Location cannot exceed 100 characters')
  ),
  website: optionalFormString(
    z.string().url('Please enter a valid URL')
  ),
  twitter: optionalFormString(
    z.string().max(15, 'Twitter username cannot exceed 15 characters')
      .regex(/^[a-zA-Z0-9_]*$/, 'Twitter username can only contain letters, numbers, and underscores')
  ),
  linkedin: optionalFormString(
    z.string().max(30, 'LinkedIn username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9-]*$/, 'LinkedIn username can only contain letters, numbers, and hyphens')
  ),
  instagram: optionalFormString(
    z.string().max(30, 'Instagram username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_.]*$/, 'Instagram username can only contain letters, numbers, dots, and underscores')
  ),
  youtube: optionalFormString(
    z.string().max(100, 'YouTube channel name cannot exceed 100 characters')
  ),
  github: optionalFormString(
    z.string().max(39, 'GitHub username cannot exceed 39 characters')
      .regex(/^[a-zA-Z0-9-]*$/, 'GitHub username can only contain letters, numbers, and hyphens')
  ),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>; 