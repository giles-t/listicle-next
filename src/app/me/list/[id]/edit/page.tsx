import { db } from "@/src/server/db";
import { listItems, lists } from "@/src/server/db/schema";
import { asc, eq } from "drizzle-orm";
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
    .orderBy(asc(listItems.sort_order));

  return (
    <EditListClient
      listId={row.id}
      listType={row.list_type as any}
      isPublished={row.is_published}
      title={row.title}
      description={row.description}
      items={items}
    />
  );
}




