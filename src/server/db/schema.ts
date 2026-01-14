import { pgTable, serial, text, varchar, timestamp, boolean, integer, pgEnum, json, uuid, primaryKey, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const listTypeEnum = pgEnum('list_type', ['ordered', 'unordered', 'reversed']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'tweet', 'youtube', 'none']);
export const publicationRoleEnum = pgEnum('publication_role', ['admin', 'editor', 'writer']);
export const notificationTypeEnum = pgEnum('notification_type', ['follow', 'comment', 'reaction_milestone', 'view_milestone']);

// Profiles table - contains public user data only
// Email and auth data remain in auth.users
// Foreign key to auth.users is set up in migration SQL
// If a profile exists, it means the user has completed onboarding (username is required)
export const profiles = pgTable('profiles', {
  id: text('id').primaryKey(), // Supabase Auth UUID - references auth.users(id)
  username: varchar('username', { length: 30 }).notNull().unique(),
  name: varchar('name', { length: 50 }).notNull(),
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

// Profiles relations
export const profilesRelations = relations(profiles, ({ many }) => ({
  lists: many(lists),
  comments: many(comments),
  reactions: many(reactions),
  publicationMembers: many(publicationMembers),
  bookmarks: many(bookmarks),
  followers: many(follows, { relationName: 'following' }),
  following: many(follows, { relationName: 'follower' }),
  notifications: many(notifications),
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
  is_pinned: boolean('is_pinned').notNull().default(false),
  allow_comments: boolean('allow_comments').notNull().default(true),
  seo_title: text('seo_title'),
  seo_description: text('seo_description'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
  published_at: timestamp('published_at'),
  view_count: integer('view_count').notNull().default(0),
  user_id: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  publication_id: uuid('publication_id').references(() => publications.id),
});

// Lists relations
export const listsRelations = relations(lists, ({ one, many }) => ({
  user: one(profiles, {
    fields: [lists.user_id],
    references: [profiles.id],
  }),
  items: many(listItems),
  comments: many(comments),
  reactions: many(reactions),
  tags: many(listToTags),
  bookmarks: many(bookmarks),
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
  view_count: integer('view_count').notNull().default(0),
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
  bookmarks: many(bookmarks),
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
  user_id: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  list_item_id: uuid('list_item_id').references(() => listItems.id, { onDelete: 'cascade' }),
  parent_id: uuid('parent_id'),
});

// Comments relations
export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(profiles, {
    fields: [comments.user_id],
    references: [profiles.id],
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
  emoji: varchar('emoji', { length: 10 }).notNull(), // Store emoji character (supports multi-byte emojis)
  created_at: timestamp('created_at').defaultNow().notNull(),
  user_id: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  list_item_id: uuid('list_item_id').references(() => listItems.id, { onDelete: 'cascade' }),
}, (t) => ({
  unique_reaction: uniqueIndex('unique_reaction_idx').on(t.user_id, t.list_id, t.list_item_id, t.emoji),
}));

// Reactions relations
export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(profiles, {
    fields: [reactions.user_id],
    references: [profiles.id],
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
  user_id: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  publication_id: uuid('publication_id').notNull().references(() => publications.id, { onDelete: 'cascade' }),
}, (t) => ({
  unique_member: uniqueIndex('unique_member_idx').on(t.user_id, t.publication_id),
}));

// Publication members relations
export const publicationMembersRelations = relations(publicationMembers, ({ one }) => ({
  user: one(profiles, {
    fields: [publicationMembers.user_id],
    references: [profiles.id],
  }),
  publication: one(publications, {
    fields: [publicationMembers.publication_id],
    references: [publications.id],
  }),
}));

// Bookmarks table
export const bookmarks = pgTable('bookmarks', {
  id: uuid('id').defaultRandom().primaryKey(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  user_id: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  list_id: uuid('list_id').notNull().references(() => lists.id, { onDelete: 'cascade' }),
  list_item_id: uuid('list_item_id').references(() => listItems.id, { onDelete: 'cascade' }),
}, (t) => ({
  // Note: Unique constraints are handled via partial unique indexes in the migration
  // to properly handle NULL values for list_item_id
}));

// Bookmarks relations
export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(profiles, {
    fields: [bookmarks.user_id],
    references: [profiles.id],
  }),
  list: one(lists, {
    fields: [bookmarks.list_id],
    references: [lists.id],
  }),
  listItem: one(listItems, {
    fields: [bookmarks.list_item_id],
    references: [listItems.id],
  }),
}));

// Follows table
export const follows = pgTable('follows', {
  id: uuid('id').defaultRandom().primaryKey(),
  follower_id: text('follower_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  following_id: text('following_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  unique_follow: uniqueIndex('unique_follow_idx').on(t.follower_id, t.following_id),
}));

// Follows relations
export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(profiles, {
    fields: [follows.follower_id],
    references: [profiles.id],
    relationName: 'follower',
  }),
  following: one(profiles, {
    fields: [follows.following_id],
    references: [profiles.id],
    relationName: 'following',
  }),
}));

// Notifications table
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  type: notificationTypeEnum('type').notNull(),
  user_id: text('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  actor_id: text('actor_id').references(() => profiles.id, { onDelete: 'cascade' }),
  list_id: uuid('list_id').references(() => lists.id, { onDelete: 'cascade' }),
  comment_id: uuid('comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  milestone_count: integer('milestone_count'),
  is_read: boolean('is_read').notNull().default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Notifications relations
export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(profiles, {
    fields: [notifications.user_id],
    references: [profiles.id],
  }),
  actor: one(profiles, {
    fields: [notifications.actor_id],
    references: [profiles.id],
  }),
  list: one(lists, {
    fields: [notifications.list_id],
    references: [lists.id],
  }),
  comment: one(comments, {
    fields: [notifications.comment_id],
    references: [comments.id],
  }),
})); 