import { z } from 'zod';

// List item schema
const listItemSchema = z.object({
  id: z.string().optional(), // ID is optional for new items
  content: z.string().min(1, 'List item content is required'),
  mediaUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  mediaType: z.enum(['image', 'tweet', 'youtube', 'none']).default('none'),
  altText: z.string().max(280, 'Alt text cannot exceed 280 characters').optional(),
  sortOrder: z.number().int().nonnegative('Sort order must be a non-negative integer').optional(),
});

export type ListItem = z.infer<typeof listItemSchema>;

// Create list schema
export const createListSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  listType: z.enum(['ordered', 'unordered', 'reversed']).default('ordered'),
  coverImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  items: z.array(listItemSchema).max(0, 'List must have no items when created').default([]),
  isPublished: z.boolean().default(false),
  publicationId: z.string().optional(),
  tags: z.array(z.string()).max(5, 'Cannot have more than 5 tags').optional(),
});

export type CreateListInput = z.infer<typeof createListSchema>;

// Update list schema
export const updateListSchema = z.object({
  id: z.string(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title cannot exceed 100 characters').optional(),
  description: z.string().max(500, 'Description cannot exceed 500 characters').optional(),
  listType: z.enum(['ordered', 'unordered', 'reversed']).optional(),
  coverImage: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  items: z.array(listItemSchema).min(1, 'List must have at least one item').optional(),
  isPublished: z.boolean().optional(),
  publicationId: z.string().optional().or(z.literal('')),
  tags: z.array(z.string()).max(5, 'Cannot have more than 5 tags').optional(),
});

export type UpdateListInput = z.infer<typeof updateListSchema>;

// List comment schema
export const commentSchema = z.object({
  listId: z.string(),
  content: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment cannot exceed 1000 characters'),
  parentId: z.string().optional(), // For replies to comments
  listItemId: z.string().optional(), // For comments on specific list items
});

export type CommentInput = z.infer<typeof commentSchema>;

// List reaction schema
export const reactionSchema = z.object({
  listId: z.string(),
  reactionType: z.enum(['like', 'love', 'celebrate', 'insightful', 'curious']),
  listItemId: z.string().optional(), // For reactions on specific list items
});

export type ReactionInput = z.infer<typeof reactionSchema>; 