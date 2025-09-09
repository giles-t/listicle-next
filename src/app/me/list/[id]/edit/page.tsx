import { db } from "@/src/server/db";
import { listItems, lists, tags, listToTags } from "@/src/server/db/schema";
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
      list_type: lists.list_type,
      is_published: lists.is_published,
      is_visible: lists.is_visible,
    })
    .from(lists)
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
    />
  );
}
