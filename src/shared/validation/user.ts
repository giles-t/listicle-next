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

// Profile form schema for client-side
export const profileFormSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  displayName: z.union([
    z.literal(''),
    z.literal(null),
    z.string().min(2, 'Display name must be at least 2 characters').max(50, 'Display name cannot exceed 50 characters')
  ]).optional(),
  bio: z.union([
    z.literal(''),
    z.literal(null),
    z.string().max(160, 'Bio cannot exceed 160 characters')
  ]).optional(),
  location: z.union([
    z.literal(''),
    z.literal(null),
    z.string().max(100, 'Location cannot exceed 100 characters')
  ]).optional(),
  website: z.union([
    z.literal(''),
    z.literal(null),
    z.string().url('Please enter a valid URL')
  ]).optional(),
  twitter: z.union([
    z.literal(''),
    z.literal(null),
    z.string()
      .max(15, 'Twitter username cannot exceed 15 characters')
      .regex(/^[a-zA-Z0-9_]*$/, 'Twitter username can only contain letters, numbers, and underscores')
  ]).optional(),
  linkedin: z.union([
    z.literal(''),
    z.literal(null),
    z.string()
      .max(30, 'LinkedIn username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9-]*$/, 'LinkedIn username can only contain letters, numbers, and hyphens')
  ]).optional(),
  instagram: z.union([
    z.literal(''),
    z.literal(null),
    z.string()
      .max(30, 'Instagram username cannot exceed 30 characters')
      .regex(/^[a-zA-Z0-9_.]*$/, 'Instagram username can only contain letters, numbers, dots, and underscores')
  ]).optional(),
  youtube: z.union([
    z.literal(''),
    z.literal(null),
    z.string().max(100, 'YouTube channel name cannot exceed 100 characters')
  ]).optional(),
  github: z.union([
    z.literal(''),
    z.literal(null),
    z.string()
      .max(39, 'GitHub username cannot exceed 39 characters')
      .regex(/^[a-zA-Z0-9-]*$/, 'GitHub username can only contain letters, numbers, and hyphens')
  ]).optional(),
});

export type ProfileFormData = z.infer<typeof profileFormSchema>; 