import { db } from "@/src/server/db";
import { listItems, lists, tags, listToTags, profiles } from "@/src/server/db/schema";
import { asc, desc, eq } from "drizzle-orm";
import EditListClient from "./EditListClient";
import { notFound } from "next/navigation";

export default async function EditList({ params }: { params: { id: string } }) {
  const id = params.id;
  const [row] = await db
    .select({
      id: lists.id,
      title: lists.title,
      description: lists.description,
      slug: lists.slug,
      list_type: lists.list_type,
      is_published: lists.is_published,
      is_visible: lists.is_visible,
      is_pinned: lists.is_pinned,
      allow_comments: lists.allow_comments,
      seo_title: lists.seo_title,
      seo_description: lists.seo_description,
      cover_image: lists.cover_image,
      publication_id: lists.publication_id,
      user_id: lists.user_id,
      username: profiles.username,
    })
    .from(lists)
    .innerJoin(profiles, eq(lists.user_id, profiles.id))
    .where(eq(lists.id, id))
    .limit(1);

  if (!row) return notFound();

  const items = await db
    .select({
      id: listItems.id,
      title: listItems.title,
      content: listItems.content,
      sort_order: listItems.sort_order,
    })
    .from(listItems)
    .where(eq(listItems.list_id, row.id))
    .orderBy(row.list_type === "reversed" ? desc(listItems.sort_order) : asc(listItems.sort_order));

  // Fetch tags for this list
  const listTags = await db
    .select({
      id: tags.id,
      name: tags.name,
    })
    .from(tags)
    .innerJoin(listToTags, eq(tags.id, listToTags.tag_id))
    .where(eq(listToTags.list_id, row.id));

  return (
    <EditListClient
      listId={row.id}
      listType={row.list_type as any}
      isPublished={row.is_published}
      isVisible={row.is_visible}
      title={row.title}
      description={row.description}
      items={items}
      categories={listTags}
      isPinned={row.is_pinned}
      allowComments={row.allow_comments}
      seoTitle={row.seo_title || ""}
      seoDescription={row.seo_description || ""}
      coverImage={row.cover_image || undefined}
      publicationId={row.publication_id}
      slug={row.slug}
      username={row.username}
    />
  );
}
