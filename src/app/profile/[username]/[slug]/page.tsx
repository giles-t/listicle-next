import { notFound } from "next/navigation";
import { getListByUsernameAndSlug } from "@/server/db/queries/profiles";
import { db } from "@/src/server/db";
import { listItems } from "@/src/server/db/schema";
import { eq, asc, desc } from "drizzle-orm";
import { Metadata } from "next";
import { StaticContentRenderer } from "@/server/components/StaticContentRenderer";
import { AuthorInfo } from "./AuthorInfo";
import { ListActions } from "./ListActions";
import { EngagementButtons } from "./EngagementButtons";
import { ItemEngagementBar } from "./ItemEngagementBar";
import { getListItemsStats } from "@/server/db/queries/list-items";
import { getBookmarkedListItems } from "@/server/db/queries/bookmarks";
import { EmptyItemContent } from "./EmptyItemContent";
import { ReactionBarWrapper } from "./ReactionBarWrapper";
import { PageContent } from "./PageContent";
import { createClient } from "@/src/server/supabase";
import { ViewTracker, ListViewTracker } from "./ViewTracker";
import { getListViewCount, getItemViewCounts } from "@/src/server/db/queries/views";

interface ViewListPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: ViewListPageProps): Promise<Metadata> {
  const { username, slug } = await params;
  const list = await getListByUsernameAndSlug(username, slug);

  if (!list) {
    return {
      title: "List Not Found",
    };
  }

  return {
    title: list.title,
    description: list.description || undefined,
    openGraph: {
      title: list.title,
      description: list.description || undefined,
      images: list.cover_image ? [list.cover_image] : undefined,
      type: "article",
      authors: [list.author_name],
      publishedTime: list.published_at?.toISOString(),
    },
    twitter: {
      card: "summary_large_image",
      title: list.title,
      description: list.description || undefined,
      images: list.cover_image ? [list.cover_image] : undefined,
    },
  };
}

export default async function ViewListPage({ params }: ViewListPageProps) {
  const { username, slug } = await params;

  // Fetch the list with author info
  const list = await getListByUsernameAndSlug(username, slug);

  if (!list) {
    notFound();
  }

  // Fetch list items
  const items = await db
    .select({
      id: listItems.id,
      title: listItems.title,
      content: listItems.content,
      sort_order: listItems.sort_order,
    })
    .from(listItems)
    .where(eq(listItems.list_id, list.id))
    .orderBy(
      list.list_type === "reversed" 
        ? desc(listItems.sort_order) 
        : asc(listItems.sort_order)
    );

  // Fetch stats for all items
  const itemIds = items.map(item => item.id);
  const itemsStats = await getListItemsStats(itemIds);

  // Fetch view counts from Redis
  const [listViewCount, itemViewCounts] = await Promise.all([
    getListViewCount(list.id),
    getItemViewCounts(itemIds),
  ]);

  // Fetch bookmarked items for current user (if authenticated)
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const bookmarkedItems = user
    ? await getBookmarkedListItems(user.id, list.id, itemIds)
    : new Set<string>();

  const viewsCount = listViewCount;
  const reactionsCount = list.likesCount ?? 0; // Now counts all reactions, not just likes
  const commentsCount = list.commentsCount ?? 0;
  const readTime = Math.max(1, Math.ceil(items.length * 0.5));

  // Helper function to check if item content is empty
  const isContentEmpty = (content: any): boolean => {
    if (!content) return true;
    if (typeof content === 'string') return content.trim() === '';
    if (typeof content === 'object') {
      // Check if it's an empty TipTap document
      if (content.type === 'doc' && (!content.content || content.content.length === 0)) return true;
      if (content.type === 'doc' && content.content.length === 1) {
        const firstNode = content.content[0];
        // Empty paragraph or empty text
        if (firstNode.type === 'paragraph' && (!firstNode.content || firstNode.content.length === 0)) return true;
        if (firstNode.type === 'paragraph' && firstNode.content.length === 1 && 
            firstNode.content[0].type === 'text' && !firstNode.content[0].text?.trim()) return true;
      }
    }
    return false;
  };

  return (
    <PageContent listId={list.id}>
      {/* View Tracking Components */}
      <ListViewTracker listId={list.id} />
      <ViewTracker listId={list.id} itemIds={itemIds} />
      
      <article className="flex h-full w-full flex-col items-start bg-default-background page-scalable text-lg">
        {/* Header Section */}
        <div className="container max-w-none flex w-full flex-col items-start gap-8 bg-default-background py-12">
        <div className="flex w-full flex-col items-center gap-6 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <h1 className="w-full text-heading-1 font-heading-1 text-default-font font-bold">
              {list.title}
            </h1>
            {list.description && (
              <p className="w-full description-text text-subtext-color">
                {list.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-4 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            {/* Author & Meta Info */}
            <AuthorInfo
              authorName={list.author_name}
              authorAvatar={list.author_avatar}
              readTime={readTime}
              publishedAt={list.published_at}
            />

            {/* Stats & Actions Bar */}
            <div className="flex w-full items-center justify-between">
              <EngagementButtons
                viewsCount={viewsCount}
                reactionsCount={reactionsCount}
                commentsCount={commentsCount}
              />
              <ListActions listId={list.id} />
            </div>

            {/* Reaction Bar */}
            <ReactionBarWrapper listId={list.id} />
          </div>
        </div>
      </div>

      {/* List Items */}
      <div className="container max-w-none flex w-full flex-col items-start gap-12 bg-default-background pb-12">
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            {list.list_type === 'unordered' ? (
              <ul className="list-disc list-outside w-full flex flex-col gap-12">
                {items.map((item) => (
                  <li key={item.id} className="list-item-marker" data-item-id={item.id}>
                    <h2 className="text-heading-2 font-heading-2 text-default-font font-bold mb-4">
                      {item.title}
                    </h2>
                    {isContentEmpty(item.content) ? (
                      <EmptyItemContent />
                    ) : (
                      <StaticContentRenderer 
                        content={item.content}
                      />
                    )}
                    <div className="mt-4">
                      <ItemEngagementBar
                        listId={list.id}
                        itemId={item.id}
                        viewsCount={itemViewCounts[item.id] ?? 0}
                        reactionsCount={itemsStats[item.id]?.reactionsCount ?? 0}
                        commentsCount={itemsStats[item.id]?.commentsCount ?? 0}
                        initialBookmarked={bookmarkedItems.has(item.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : list.list_type === 'reversed' ? (
              <ol className="list-decimal list-outside w-full flex flex-col gap-12" reversed>
                {items.map((item) => (
                  <li key={item.id} className="list-item-marker" data-item-id={item.id}>
                    <h2 className="text-heading-2 font-heading-2 text-default-font font-bold mb-4">
                      {item.title}
                    </h2>
                    {isContentEmpty(item.content) ? (
                      <EmptyItemContent />
                    ) : (
                      <StaticContentRenderer 
                        content={item.content}
                      />
                    )}
                    <div className="mt-4">
                      <ItemEngagementBar
                        listId={list.id}
                        itemId={item.id}
                        viewsCount={itemViewCounts[item.id] ?? 0}
                        reactionsCount={itemsStats[item.id]?.reactionsCount ?? 0}
                        commentsCount={itemsStats[item.id]?.commentsCount ?? 0}
                        initialBookmarked={bookmarkedItems.has(item.id)}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <ol className="list-decimal list-outside w-full flex flex-col gap-12">
                {items.map((item) => (
                  <li key={item.id} className="list-item-marker" data-item-id={item.id}>
                    <h2 className="text-heading-2 font-heading-2 text-default-font font-bold mb-4">
                      {item.title}
                    </h2>
                    {isContentEmpty(item.content) ? (
                      <EmptyItemContent />
                    ) : (
                      <StaticContentRenderer 
                        content={item.content}
                      />
                    )}
                    <div className="mt-4">
                      <ItemEngagementBar
                        listId={list.id}
                        itemId={item.id}
                        viewsCount={itemViewCounts[item.id] ?? 0}
                        reactionsCount={itemsStats[item.id]?.reactionsCount ?? 0}
                        commentsCount={itemsStats[item.id]?.commentsCount ?? 0}
                        initialBookmarked={bookmarkedItems.has(item.id)}
                      />
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </article>
    </PageContent>
  );
}

