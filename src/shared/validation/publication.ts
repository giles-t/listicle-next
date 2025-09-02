import { z } from 'zod';

// Publication member roles
export const publicationRoles = ['admin', 'editor', 'writer'] as const;

// Create publication schema
export const createPublicationSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(30, 'Slug cannot exceed 30 characters')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export type CreatePublicationInput = z.infer<typeof createPublicationSchema>;

// Update publication schema
export const updatePublicationSchema = z.object({
  id: z.string(),
  name: z.string().min(3, 'Name must be at least 3 characters').max(50, 'Name cannot exceed 50 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  websiteUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  logoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

export type UpdatePublicationInput = z.infer<typeof updatePublicationSchema>;

// Invite member schema
export const inviteMemberSchema = z.object({
  publicationId: z.string(),
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(publicationRoles).default('writer'),
  message: z.string().max(500, 'Message cannot exceed 500 characters').optional(),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// Update member role schema
export const updateMemberRoleSchema = z.object({
  publicationId: z.string(),
  userId: z.string(),
  role: z.enum(publicationRoles),
});

export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

// Remove member schema
export const removeMemberSchema = z.object({
  publicationId: z.string(),
  userId: z.string(),
});

export type RemoveMemberInput = z.infer<typeof removeMemberSchema>; 