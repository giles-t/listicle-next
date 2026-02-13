"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { Avatar } from "@/ui/components/Avatar";
import { Badge } from "@/ui/components/Badge";
import { BookmarkCardComponent } from "@/ui/components/BookmarkCardComponent";
import { BookmarkListComponent } from "@/ui/components/BookmarkListComponent";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { TextField } from "@/ui/components/TextField";
import { ToggleGroup } from "@/ui/components/ToggleGroup";
import { Loader } from "@/ui/components/Loader";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import AddToBookmarkDrawer from "@/client/components/AddToBookmarkDrawer";
import ManageCollectionsDrawer from "@/client/components/ManageCollectionsDrawer";
import {
  FeatherChevronDown,
  FeatherFolder,
  FeatherFolderPlus,
  FeatherGrid,
  FeatherList,
  FeatherMapPin,
  FeatherMoreHorizontal,
  FeatherSearch,
  FeatherTrash,
  FeatherBookmark,
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import { toast } from "@subframe/core";
import { formatRelativeTime, formatShortDate } from "@/shared/utils/date";
import { formatNumber } from "@/shared/utils/format";

export type BookmarkData = {
  id: string;
  created_at: string;
  type: 'list' | 'list_item';
  collection: {
    id: string;
    name: string;
  } | null;
  list: {
    id: string;
    title: string;
    description: string | null;
    slug: string;
    cover_image: string | null;
    view_count: number;
    published_at: string | null;
  };
  list_item: {
    id: string;
    title: string;
    content: string;
    image: string | null;
    media_url: string | null;
  } | null;
  author: {
    id: string;
    username: string;
    name: string;
    avatar: string | null;
  };
  categories: Array<{
    id: string;
    name: string;
    slug: string;
    icon: string;
    color: string;
  }>;
  stats: {
    reactions: number;
    comments: number;
  };
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
};

export type Collection = {
  id: string;
  name: string;
  bookmarkCount: number;
};

type ViewMode = 'card' | 'list';
type SortOption = 'newest' | 'oldest' | 'alphabetical';

type Props = {
  initialBookmarks: BookmarkData[];
  initialCategories: Category[];
  initialCollections: Collection[];
  totalCount: number;
};

export default function BookmarksClient({ 
  initialBookmarks, 
  initialCategories, 
  initialCollections,
  totalCount 
}: Props) {
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>(initialBookmarks);
  const [categories] = useState<Category[]>(initialCategories);
  const [collections, setCollections] = useState<Collection[]>(initialCollections);
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedCollection, setSelectedCollection] = useState<string | null | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  // Collection manager drawer state (for moving bookmarks to collections)
  const [collectionDrawerOpen, setCollectionDrawerOpen] = useState(false);
  const [selectedBookmarkForCollection, setSelectedBookmarkForCollection] = useState<BookmarkData | null>(null);
  const [isDrawerLoading, setIsDrawerLoading] = useState(false);
  
  // Manage collections drawer state (for creating/deleting collections)
  const [manageCollectionsDrawerOpen, setManageCollectionsDrawerOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Fetch bookmarks with filters
  const fetchBookmarks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedCollection !== 'all') {
        params.set('collection', selectedCollection === null ? 'none' : selectedCollection);
      }
      params.set('sort', sortBy);

      const res = await fetch(`/api/me/bookmarks?${params.toString()}`, {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch bookmarks');

      const data = await res.json();
      setBookmarks(data.bookmarks);
    } catch (error) {
      toast.error('Failed to load bookmarks');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCollection, sortBy]);

  // Fetch collections
  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/me/collections', {
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to fetch collections');

      const data = await res.json();
      setCollections(data.collections || []);
    } catch (error) {
      console.error('Failed to fetch collections:', error);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchBookmarks();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedCollection, sortBy, fetchBookmarks]);

  // Handle delete bookmark
  const handleDeleteBookmark = async (bookmarkId: string) => {
    try {
      setIsDeleting(bookmarkId);
      const res = await fetch(`/api/me/bookmarks/${bookmarkId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete bookmark');

      setBookmarks((prev) => prev.filter((b) => b.id !== bookmarkId));
      toast.success('Bookmark removed');
      // Refresh collections to update counts
      fetchCollections();
    } catch (error) {
      toast.error('Failed to remove bookmark');
    } finally {
      setIsDeleting(null);
    }
  };

  // Handle opening collection manager
  const handleOpenCollectionManager = (bookmark: BookmarkData) => {
    setSelectedBookmarkForCollection(bookmark);
    setCollectionDrawerOpen(true);
  };

  // Handle collection change (save)
  const handleCollectionSave = async (collectionId: string | null, collectionName: string | null) => {
    if (!selectedBookmarkForCollection) return;

    setIsDrawerLoading(true);
    try {
      const res = await fetch(`/api/me/bookmarks/${selectedBookmarkForCollection.id}/collection`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ collectionId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update collection');
      }

      setBookmarks((prev) =>
        prev.map((b) =>
          b.id === selectedBookmarkForCollection.id
            ? {
                ...b,
                collection: collectionId && collectionName
                  ? { id: collectionId, name: collectionName }
                  : null,
              }
            : b
        )
      );
      setCollectionDrawerOpen(false);
      toast.success(collectionId ? 'Moved to collection' : 'Removed from collection');
      // Refresh collections to update counts
      fetchCollections();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update collection');
    } finally {
      setIsDrawerLoading(false);
    }
  };

  // Handle bookmark delete from drawer
  const handleBookmarkDeleteFromDrawer = async () => {
    if (!selectedBookmarkForCollection) return;
    setIsDrawerLoading(true);
    try {
      await handleDeleteBookmark(selectedBookmarkForCollection.id);
      setCollectionDrawerOpen(false);
    } finally {
      setIsDrawerLoading(false);
    }
  };

  // Get display info for a bookmark
  const getBookmarkDisplay = (bookmark: BookmarkData) => {
    const isListItem = bookmark.type === 'list_item' && bookmark.list_item;
    const title = isListItem ? bookmark.list_item!.title : bookmark.list.title;
    const description = isListItem
      ? `From "${bookmark.list.title}"`
      : bookmark.list.description;
    // For list items, prefer the dedicated image field, then media_url, then list cover
    const image = isListItem
      ? bookmark.list_item!.image || bookmark.list_item!.media_url || bookmark.list.cover_image
      : bookmark.list.cover_image;
    const href = `/@${bookmark.author.username}/${bookmark.list.slug}${isListItem ? `#item-${bookmark.list_item!.id}` : ''}`;

    return { title, description, image, href, isListItem };
  };

  // Get the selected category name for display
  const selectedCategoryName = useMemo(() => {
    if (!selectedCategory) return 'Category';
    const cat = categories.find((c) => c.slug === selectedCategory);
    return cat?.name || 'Category';
  }, [selectedCategory, categories]);

  // Get the selected collection name for display
  const selectedCollectionName = useMemo(() => {
    if (selectedCollection === 'all') return 'Collection';
    if (selectedCollection === null) return 'Uncategorized';
    const col = collections.find((c) => c.id === selectedCollection);
    return col?.name || 'Collection';
  }, [selectedCollection, collections]);

  // Get sort label
  const sortLabel = useMemo(() => {
    switch (sortBy) {
      case 'oldest':
        return 'Oldest first';
      case 'alphabetical':
        return 'Alphabetical';
      default:
        return 'Date Added';
    }
  }, [sortBy]);

  // Create menu actions for a bookmark
  const createMenuActions = (bookmark: BookmarkData) => (
    <DropdownMenu>
      <DropdownMenu.DropdownItem
        icon={<FeatherFolder />}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenCollectionManager(bookmark);
        }}
      >
        Change collection
      </DropdownMenu.DropdownItem>
      <DropdownMenu.DropdownDivider />
      <DropdownMenu.DropdownItem
        className="[&>*]:text-error-600"
        icon={<FeatherTrash />}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleDeleteBookmark(bookmark.id);
        }}
      >
        Delete bookmark
      </DropdownMenu.DropdownItem>
    </DropdownMenu>
  );

  // Create menu for list view
  const createListMenu = (bookmark: BookmarkData) => (
    <SubframeCore.DropdownMenu.Root>
      <SubframeCore.DropdownMenu.Trigger asChild={true}>
        <IconButton
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherMoreHorizontal />}
          loading={isDeleting === bookmark.id}
          onClick={(e) => e.preventDefault()}
        />
      </SubframeCore.DropdownMenu.Trigger>
      <SubframeCore.DropdownMenu.Portal>
        <SubframeCore.DropdownMenu.Content
          side="bottom"
          align="end"
          sideOffset={4}
          asChild={true}
        >
          <DropdownMenu>
            <DropdownMenu.DropdownItem
              icon={<FeatherFolder />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleOpenCollectionManager(bookmark);
              }}
            >
              Change collection
            </DropdownMenu.DropdownItem>
            <DropdownMenu.DropdownDivider />
            <DropdownMenu.DropdownItem
              className="[&>*]:text-error-600"
              icon={<FeatherTrash />}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteBookmark(bookmark.id);
              }}
            >
              Delete bookmark
            </DropdownMenu.DropdownItem>
          </DropdownMenu>
        </SubframeCore.DropdownMenu.Content>
      </SubframeCore.DropdownMenu.Portal>
    </SubframeCore.DropdownMenu.Root>
  );

  // Card view item using BookmarkCardComponent
  const CardItem = ({ bookmark }: { bookmark: BookmarkData }) => {
    const { title, description, image, href } = getBookmarkDisplay(bookmark);
    const primaryCategory = bookmark.categories[0];
    const categoryDisplay = primaryCategory?.name || "Uncategorized";

    return (
      <Link href={href} className="block">
        <BookmarkCardComponent
          image={image || undefined}
          collectionBadge={
            bookmark.collection ? (
              <Badge variant="neutral" icon={<FeatherFolder />}>
                {bookmark.collection.name}
              </Badge>
            ) : undefined
          }
          category={categoryDisplay}
          title={title}
          description={description || undefined}
          viewCount={formatNumber(bookmark.list.view_count)}
          likeCount={formatNumber(bookmark.stats.reactions)}
          commentCount={formatNumber(bookmark.stats.comments)}
          authorAvatar={
            <Avatar
              size="small"
              image={bookmark.author.avatar || undefined}
            >
              {bookmark.author.name.charAt(0).toUpperCase()}
            </Avatar>
          }
          authorName={bookmark.author.name}
          timestamp={isClient ? formatRelativeTime(bookmark.created_at) : formatShortDate(bookmark.created_at)}
          menuActions={createMenuActions(bookmark)}
        />
      </Link>
    );
  };

  // List view item using BookmarkListComponent
  const ListItem = ({ bookmark }: { bookmark: BookmarkData }) => {
    const { title, description, image, href } = getBookmarkDisplay(bookmark);
    const primaryCategory = bookmark.categories[0];
    const categoryDisplay = primaryCategory?.name || "Uncategorized";

    return (
      <Link href={href} className="block w-full">
        <BookmarkListComponent
          image={image || undefined}
          title={title}
          description={description || undefined}
          collectionBadge={
            bookmark.collection ? (
              <Badge variant="neutral" icon={<FeatherFolder />}>
                {bookmark.collection.name}
              </Badge>
            ) : undefined
          }
          category={categoryDisplay}
          viewCount={formatNumber(bookmark.list.view_count)}
          likeCount={formatNumber(bookmark.stats.reactions)}
          commentCount={formatNumber(bookmark.stats.comments)}
          authorName={bookmark.author.name}
          timeAgo={isClient ? formatRelativeTime(bookmark.created_at) : formatShortDate(bookmark.created_at)}
          menu={createListMenu(bookmark)}
        />
      </Link>
    );
  };

  // Empty state
  const EmptyState = () => (
    <div className="flex w-full flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <IconWithBackground variant="neutral" size="large" icon={<FeatherBookmark />} />
      </div>
      <h3 className="text-heading-3 font-heading-3 text-default-font mb-2">
        {searchQuery || selectedCategory || selectedCollection !== 'all' ? 'No bookmarks found' : 'No bookmarks yet'}
      </h3>
      <p className="text-body font-body text-subtext-color mb-6 max-w-md">
        {searchQuery || selectedCategory || selectedCollection !== 'all'
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'When you bookmark lists or items, they\'ll appear here for easy access.'}
      </p>
      {(searchQuery || selectedCategory || selectedCollection !== 'all') && (
        <Button
          variant="neutral-secondary"
          onClick={() => {
            setSearchQuery('');
            setSelectedCategory(null);
            setSelectedCollection('all');
          }}
        >
          Clear filters
        </Button>
      )}
    </div>
  );

  return (
    <>
      <div className="flex w-full flex-col items-start gap-6 px-6 py-6 mobile:px-4 mobile:py-4">
        {/* Header */}
        <div className="flex w-full items-end justify-between mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-between mobile:gap-4">
          <div className="flex flex-col items-start gap-1">
            <span className="text-heading-2 font-heading-2 text-default-font">
              Bookmarks
            </span>
            <span className="text-body font-body text-subtext-color">
              Manage and organize your saved listicles and inspiration.
            </span>
          </div>
          <Button
            icon={<FeatherFolderPlus />}
            onClick={() => setManageCollectionsDrawerOpen(true)}
          >
            Manage Collections
          </Button>
        </div>

        {/* Filters and content */}
        <div className="flex w-full flex-col items-start gap-4">
          {/* Filters bar */}
          <div className="flex w-full items-center justify-between border-b border-solid border-neutral-border pb-4 mobile:flex-col mobile:flex-nowrap mobile:items-start mobile:justify-start mobile:gap-4">
            <div className="flex items-center gap-2 mobile:h-auto mobile:w-full mobile:flex-none mobile:flex-row mobile:flex-wrap mobile:gap-2">
              {/* Search */}
              <TextField
                className="h-auto w-64 flex-none mobile:grow mobile:shrink-0 mobile:basis-0"
                variant="outline"
                label=""
                helpText=""
                icon={<FeatherSearch />}
              >
                <TextField.Input
                  placeholder="Search bookmarks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </TextField>

              {/* Collection filter */}
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-secondary"
                    iconRight={<FeatherChevronDown />}
                  >
                    {selectedCollectionName}
                  </Button>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem
                        icon={null}
                        onClick={() => setSelectedCollection('all')}
                      >
                        All Collections
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        icon={null}
                        onClick={() => setSelectedCollection(null)}
                      >
                        Uncategorized
                      </DropdownMenu.DropdownItem>
                      {collections.length > 0 && <DropdownMenu.DropdownDivider />}
                      {collections.map((col) => (
                        <DropdownMenu.DropdownItem
                          key={col.id}
                          icon={<FeatherFolder />}
                          onClick={() => setSelectedCollection(col.id)}
                        >
                          {col.name}
                        </DropdownMenu.DropdownItem>
                      ))}
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>

              {/* Category filter */}
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-secondary"
                    iconRight={<FeatherChevronDown />}
                  >
                    {selectedCategoryName}
                  </Button>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem
                        icon={null}
                        onClick={() => setSelectedCategory(null)}
                      >
                        All Categories
                      </DropdownMenu.DropdownItem>
                      {categories.length > 0 && <DropdownMenu.DropdownDivider />}
                      {categories.map((cat) => (
                        <DropdownMenu.DropdownItem
                          key={cat.id}
                          icon={<FeatherFolder />}
                          onClick={() => setSelectedCategory(cat.slug)}
                        >
                          {cat.name}
                        </DropdownMenu.DropdownItem>
                      ))}
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>

              {/* Sort filter */}
              <SubframeCore.DropdownMenu.Root>
                <SubframeCore.DropdownMenu.Trigger asChild={true}>
                  <Button
                    variant="neutral-secondary"
                    iconRight={<FeatherChevronDown />}
                  >
                    {sortLabel}
                  </Button>
                </SubframeCore.DropdownMenu.Trigger>
                <SubframeCore.DropdownMenu.Portal>
                  <SubframeCore.DropdownMenu.Content
                    side="bottom"
                    align="start"
                    sideOffset={4}
                    asChild={true}
                  >
                    <DropdownMenu>
                      <DropdownMenu.DropdownItem
                        icon={null}
                        onClick={() => setSortBy('newest')}
                      >
                        Newest first
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownItem
                        icon={null}
                        onClick={() => setSortBy('oldest')}
                      >
                        Oldest first
                      </DropdownMenu.DropdownItem>
                      <DropdownMenu.DropdownDivider />
                      <DropdownMenu.DropdownItem
                        icon={null}
                        onClick={() => setSortBy('alphabetical')}
                      >
                        Alphabetical
                      </DropdownMenu.DropdownItem>
                    </DropdownMenu>
                  </SubframeCore.DropdownMenu.Content>
                </SubframeCore.DropdownMenu.Portal>
              </SubframeCore.DropdownMenu.Root>
            </div>

            {/* View toggle - hidden on mobile */}
            <div className="flex items-center gap-2">
              <ToggleGroup
                className="mobile:hidden"
                value={viewMode}
                onValueChange={(value: string) => {
                  if (value === 'card' || value === 'list') {
                    setViewMode(value);
                  }
                }}
              >
                <ToggleGroup.Item icon={<FeatherGrid />} value="card" />
                <ToggleGroup.Item icon={<FeatherList />} value="list" />
              </ToggleGroup>
            </div>
          </div>

          {/* Loading state */}
          {isLoading && (
            <div className="flex w-full items-center justify-center py-12">
              <Loader size="medium" />
            </div>
          )}

          {/* Content */}
          {!isLoading && bookmarks.length === 0 && <EmptyState />}

          {!isLoading && bookmarks.length > 0 && (
            <>
              {/* Card view (also used on mobile regardless of toggle) */}
              {viewMode === 'card' ? (
                <div className="w-full items-start gap-6 grid grid-cols-3 mobile:grid mobile:grid-cols-1 tablet:grid-cols-2">
                  {bookmarks.map((bookmark) => (
                    <CardItem key={bookmark.id} bookmark={bookmark} />
                  ))}
                </div>
              ) : (
                <>
                  {/* List view on desktop, card view on mobile */}
                  <div className="hidden mobile:grid w-full items-start gap-6 grid-cols-1">
                    {bookmarks.map((bookmark) => (
                      <CardItem key={bookmark.id} bookmark={bookmark} />
                    ))}
                  </div>
                  <div className="flex w-full flex-col items-start gap-2 mobile:hidden">
                    {bookmarks.map((bookmark) => (
                      <ListItem key={bookmark.id} bookmark={bookmark} />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add to Bookmark Drawer */}
      {selectedBookmarkForCollection && (
        <AddToBookmarkDrawer
          open={collectionDrawerOpen}
          onOpenChange={setCollectionDrawerOpen}
          isBookmarked={true}
          currentCollectionId={selectedBookmarkForCollection.collection?.id || null}
          onSave={handleCollectionSave}
          onDelete={handleBookmarkDeleteFromDrawer}
          isLoading={isDrawerLoading}
        />
      )}

      {/* Manage Collections Drawer */}
      <ManageCollectionsDrawer
        open={manageCollectionsDrawerOpen}
        onOpenChange={setManageCollectionsDrawerOpen}
        collections={collections}
        onCollectionsChange={(updatedCollections: Collection[]) => {
          setCollections(updatedCollections);
          // Refresh bookmarks to reflect collection changes
          fetchBookmarks();
        }}
      />
    </>
  );
}
