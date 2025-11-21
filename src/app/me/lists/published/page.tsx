import { createClient } from "@/src/server/supabase";
import { db } from "@/src/server/db";
import { lists as listsTable, profiles } from "@/src/server/db/schema";
import { eq } from "drizzle-orm";
import UserListsClient, { type UserList as UserListType, type UserProfileLite } from "../UserListsClient";

export default async function PublishedListsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [profileRow] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);

  const rows = await db
    .select({
      id: listsTable.id,
      title: listsTable.title,
      description: listsTable.description,
      slug: listsTable.slug,
      list_type: listsTable.list_type,
      cover_image: listsTable.cover_image,
      is_published: listsTable.is_published,
      created_at: listsTable.created_at,
      updated_at: listsTable.updated_at,
      published_at: listsTable.published_at,
    })
    .from(listsTable)
    .where(eq(listsTable.user_id, user.id))
    .orderBy(listsTable.created_at);

  const profile: UserProfileLite = {
    id: profileRow?.id ?? user.id,
    username: profileRow?.username ?? null,
    name: profileRow?.name ?? null,
    avatar: profileRow?.avatar ?? null,
    emailInitial: user.email?.[0]?.toUpperCase() ?? "U",
  };

  return <UserListsClient initialLists={rows as unknown as UserListType[]} profile={profile} filter="published" />;
}


