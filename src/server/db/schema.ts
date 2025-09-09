import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum, json, uuid, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const listTypeEnum = pgEnum('list_type', ['ordered', 'unordered', 'reversed']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'tweet', 'youtube', 'none']);
export const publicationRoleEnum = pgEnum('publication_role', ['admin', 'editor', 'writer']);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'love', 'celebrate', 'insightful', 'curious']);

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey(), // Supabase Auth UUID
  username: varchar('username', { length: 30 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  avatar: text('avatar'),
  bio: text('bio'),
  location: varchar('location', { length: 100 }),
  website: text('website'),
  twitter: text('twitter'),
  linkedin: text('linkedin'),
  instagram: text('instagram'),
  youtube: text('youtube'),
  github: text('github'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Users relations
export const usersRelations = relations(users, ({ many }) => ({
  lists: many(lists),
  comments: many(comments),
  reactions: many(reactions),
  publicationMembers: many(publicationMembers),
}));

// Lists table
export const lists = pgTable('lists', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  slug: varchar('slug', { length: 150 }).notNull(),
  list_type: listTypeEnum('list_type').notNull().default('ordered'),
  cover_image: text('cover_image'),
  is_published: boolean('is_published').notNull().default(false),
  is_visible: boolean('is_visible').notNull().default(true),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  published_at: timestamp('published_at'),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  publication_id: uuid('publication_id').references(() => publications.id),
});

// Lists relations
export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(users, {
    fields: [lists.user_id],
    references: [users.id],
  }),
  items: many(listItems),
  comments: many(comments),
  reactions: many(reactions),
  tags: many(listToTags),
  publication: one(publications, {
    fields: [lists.publication_id],
    references: [publications.id],
  }),
}));

// List items table
export const listItems = pgTable('list_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull(),
  media_url: text('media_url'),
  media_type: mediaTypeEnum('media_type').notNull().default('none'),
  alt_text: text('alt_text'),
  sort_order: integer('sort_order').notNull().default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
});

// List items relations
export const listItemsRelations = relations(listItems, ({ one, many }) => ({
  list: one(lists, {
    fields: [listItems.list_id],
    references: [lists.id],
  }),
  comments: many(comments),
  reactions: many(reactions),
}));

// Tags table
export const tags = pgTable('tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull().unique(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Tags relations
export const tagsRelations = relations(tags, ({ many }) => ({
  lists: many(listToTags),
}));

// List to Tags (junction table)
export const listToTags = pgTable('list_to_tags', {
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  tag_id: uuid('tag_id').notNull().references(() => tags.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.list_id, t.tag_id] }),
}));

// List to Tags relations
export const listToTagsRelations = relations(listToTags, ({ one }) => ({
  list: one(lists, {
    fields: [listToTags.list_id],
    references: [lists.id],
  }),
  tag: one(tags, {
    fields: [listToTags.tag_id],
    references: [tags.id],
  }),
}));

// Comments table
export const comments = pgTable('comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  content: text('content').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  list_item_id: uuid('list_item_id').references(() => listItems.id, { onDelete: 'cascade' }),
  parent_id: uuid('parent_id'),
});

// Comments relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.user_id],
    references: [users.id],
  }),
  list: one(lists, {
    fields: [comments.list_id],
    references: [lists.id],
  }),
  listItem: one(listItems, {
    fields: [comments.list_item_id],
    references: [listItems.id],
  }),
  parent: one(comments, {
    fields: [comments.parent_id],
    references: [comments.id],
    relationName: 'parent_child',
  }),
  replies: many(comments, { relationName: 'parent_child' }),
}));

// Reactions table
export const reactions = pgTable('reactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  reaction_type: reactionTypeEnum('reaction_type').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  list_item_id: uuid('list_item_id').references(() => listItems.id, { onDelete: 'cascade' }),
}, (t) => ({
  unique_reaction: uniqueIndex('unique_reaction_idx').on(t.user_id, t.list_id, t.list_item_id, t.reaction_type),
}));

// Reactions relations
export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.user_id],
    references: [users.id],
  }),
  list: one(lists, {
    fields: [reactions.list_id],
    references: [lists.id],
  }),
  listItem: one(listItems, {
    fields: [reactions.list_item_id],
    references: [listItems.id],
  }),
}));

// Publications table
export const publications = pgTable('publications', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 30 }).notNull().unique(),
  description: text('description'),
  website_url: text('website_url'),
  logo_url: text('logo_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Publications relations
export const publicationsRelations = relations(publications, ({ many }) => ({
  members: many(publicationMembers),
  lists: many(lists),
}));

// Publication members table
export const publicationMembers = pgTable('publication_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: publicationRoleEnum('role').notNull().default('writer'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  publication_id: uuid('publication_id').notNull().references(() => publications.id, { onDelete: 'cascade' }),
}, (t) => ({
  unique_member: uniqueIndex('unique_member_idx').on(t.user_id, t.publication_id),
}));

// Publication members relations
export const publicationMembersRelations = relations(publicationMembers, ({ one }) => ({
  user: one(users, {
    fields: [publicationMembers.user_id],
    references: [users.id],
  }),
  publication: one(publications, {
    fields: [publicationMembers.publication_id],
    references: [publications.id],
  }),
})); 