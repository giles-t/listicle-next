"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/ui/components/Button";
import { Tabs } from "@/ui/components/Tabs";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Badge } from "@/ui/components/Badge";
import { Avatar } from "@/ui/components/Avatar";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { Loader } from "@/ui/components/Loader";
import * as SubframeCore from "@subframe/core";
import {
  FeatherEye,
  FeatherFileText,
  FeatherMoreHorizontal,
  FeatherEdit2,
  FeatherTrash,
  FeatherShare2,
  FeatherList,
  FeatherHeart,
  FeatherMessageSquare,
  FeatherPlus,
  FeatherCheckCircle,
} from "@subframe/core";
import { formatRelativeTime, formatShortDate } from "@/shared/utils/date";
import { extractPlainText } from "@/shared/utils/tiptap-text";
import { toast } from "@subframe/core";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export type UserList = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  list_type: "ordered" | "unordered" | "reversed";
  cover_image: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  view_count: number;
  itemCount: number;
  reactionsCount: number;
  commentsCount: number;
};

export type UserProfileLite = {
  id: string;
  username: string | null;
  name: string | null;
  avatar: string | null;
  emailInitial: string;
};

type Props = {
  initialLists: UserList[];
  profile: UserProfileLite;
  filter?: "all" | "drafts" | "published";
};

export default function UserListsClient({ initialLists, profile, filter = "all" }: Props) {
  const router = useRouter();
  const [lists, setLists] = useState<UserList[]>(initialLists);
  const [isClient, setIsClient] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserList | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredLists = useMemo(() => {
    switch (filter) {
      case "drafts":
        return lists.filter((l) => !l.is_published);
      case "published":
        return lists.filter((l) => l.is_published);
      default:
        return lists;
    }
  }, [lists, filter]);

  const draftLists = useMemo(() => filteredLists.filter((l) => !l.is_published), [filteredLists]);
  const publishedLists = useMemo(() => filteredLists.filter((l) => l.is_published), [filteredLists]);

  const handleCreateNewList = () => router.push("/create");
  const handleEditList = (listId: string) => router.push(`/me/list/${listId}/edit`);
  const handlePreviewList = (slug: string) => {
    const username = profile.username || "user";
    router.push(`/@${username}/${slug}?preview=true`);
  };
  const handleShareList = async (slug: string) => {
    const username = profile.username || "user";
    const url = `${window.location.origin}/@${username}/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };
  const handleDuplicateList = async (_listId: string) => {
    toast.info("Duplicate feature coming soon!");
  };
  const handleArchiveList = async (_listId: string) => {
    toast.info("Archive feature coming soon!");
  };
  const onDeleteList = async (listId: string) => {
    try {
      setIsDeleting(listId);
      const res = await fetch(`/api/lists/${listId}`, { method: "DELETE", credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete list");
      setLists((prev) => prev.filter((l) => l.id !== listId));
      toast.success("List deleted successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to delete list");
    } finally {
      setIsDeleting(null);
    }
  };

  const requestDelete = (list: UserList) => {
    setDeleteTarget(list);
    setIsConfirmOpen(true);
  };

  const formatCount = (count: number): string => {
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
    if (count >= 1_000) return `${(count / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    return String(count);
  };

  const ListRow: React.FC<{ list: UserList; isDraft: boolean }> = ({ list, isDraft }) => {
    const editHref = `/me/list/${list.id}/edit`;

    const dateLabel = isDraft
      ? `Created ${isClient ? formatRelativeTime(list.created_at) : formatShortDate(list.created_at)}`
      : `Published ${isClient ? formatRelativeTime(list.published_at || list.created_at) : formatShortDate(list.published_at || list.created_at)}`;

    const editedLabel =
      isDraft && isClient
        ? `Edited ${formatRelativeTime(list.updated_at)}`
        : isDraft
          ? `Edited ${formatShortDate(list.updated_at)}`
          : null;

    return (
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(editHref)}
        onKeyDown={(e) => { if (e.key === "Enter") router.push(editHref); }}
        className="flex w-full overflow-hidden rounded-lg border border-solid border-neutral-border bg-default-background shadow-md items-stretch mobile:flex-col mobile:flex-nowrap mobile:gap-0 hover:shadow-lg transition-shadow cursor-pointer"
      >
        <div className="flex w-80 flex-none flex-col items-start relative mobile:h-48 mobile:w-full mobile:flex-none">
          {list.cover_image ? (
            <img
              className="min-h-[0px] w-full grow shrink-0 basis-0 object-cover"
              src={list.cover_image}
              alt={list.title}
            />
          ) : (
            <div className="flex min-h-[0px] w-full grow shrink-0 basis-0 items-center justify-center bg-neutral-100">
              <FeatherFileText className="text-heading-1 font-heading-1 text-neutral-400" />
            </div>
          )}
          {isDraft ? (
            <Badge
              className="absolute top-3 left-3 bg-default-background/90 border border-solid border-neutral-300"
              variant="neutral"
              icon={null}
            >
              Draft
            </Badge>
          ) : (
            <Badge className="absolute top-3 left-3" variant="success" icon={null}>
              Published
            </Badge>
          )}
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 px-6 py-6">
          <div className="flex w-full items-start justify-between">
            <div className="flex grow shrink-0 basis-0 flex-col items-start gap-1">
              <span className="text-heading-3 font-heading-3 text-default-font">
                {list.title}
              </span>
              <span className="text-caption font-caption text-subtext-color">
                {dateLabel}
                {editedLabel && ` · ${editedLabel}`}
              </span>
            </div>
            <SubframeCore.DropdownMenu.Root>
              <SubframeCore.DropdownMenu.Trigger asChild={true}>
                <IconButton
                  variant="neutral-tertiary"
                  size="medium"
                  icon={<FeatherMoreHorizontal />}
                  loading={isDeleting === list.id}
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => e.stopPropagation()}
                />
              </SubframeCore.DropdownMenu.Trigger>
              <SubframeCore.DropdownMenu.Portal>
                <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
                  <DropdownMenu onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                    {isDraft ? (
                      <>
                        <DropdownMenu.DropdownItem icon={<FeatherEdit2 />} onClick={() => handleEditList(list.id)}>
                          Edit
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownDivider />
                        <DropdownMenu.DropdownItem
                          className="text-error-600"
                          icon={<FeatherTrash />}
                          onClick={() => requestDelete(list)}
                        >
                          Delete
                        </DropdownMenu.DropdownItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenu.DropdownItem icon={<FeatherEdit2 />} onClick={() => handleEditList(list.id)}>
                          Edit
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem
                          icon={<FeatherEye />}
                          onClick={() => router.push(`/@${profile.username || "user"}/${list.slug}`)}
                        >
                          View
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownItem
                          icon={<FeatherShare2 />}
                          onClick={() => handleShareList(list.slug)}
                        >
                          Share
                        </DropdownMenu.DropdownItem>
                        <DropdownMenu.DropdownDivider />
                        <DropdownMenu.DropdownItem
                          className="text-error-600"
                          icon={<FeatherTrash />}
                          onClick={() => requestDelete(list)}
                        >
                          Delete
                        </DropdownMenu.DropdownItem>
                      </>
                    )}
                  </DropdownMenu>
                </SubframeCore.DropdownMenu.Content>
              </SubframeCore.DropdownMenu.Portal>
            </SubframeCore.DropdownMenu.Root>
          </div>
          {list.description ? (
            <span className="line-clamp-2 text-body font-body text-subtext-color">
              {extractPlainText(list.description)}
            </span>
          ) : null}
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-1">
              <FeatherList className="text-caption font-caption text-subtext-color" />
              <span className="text-caption font-caption text-subtext-color">
                {list.itemCount} {list.itemCount === 1 ? "item" : "items"}
              </span>
            </div>
            {!isDraft && (
              <>
                <div className="flex items-center gap-1">
                  <FeatherEye className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    {formatCount(list.view_count)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FeatherHeart className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    {formatCount(list.reactionsCount)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FeatherMessageSquare className="text-caption font-caption text-subtext-color" />
                  <span className="text-caption font-caption text-subtext-color">
                    {formatCount(list.commentsCount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const EmptyState: React.FC = () => {
    const icon =
      filter === "drafts" ? (
        <FeatherEdit2 className="text-heading-1 font-heading-1 text-neutral-400" />
      ) : filter === "published" ? (
        <FeatherCheckCircle className="text-heading-1 font-heading-1 text-neutral-400" />
      ) : (
        <FeatherFileText className="text-heading-1 font-heading-1 text-neutral-400" />
      );

    const heading =
      filter === "drafts"
        ? "Your drafts will appear here"
        : filter === "published"
          ? "No published lists yet"
          : "No lists yet";

    const description =
      filter === "drafts"
        ? "Create a new list and work on it at your own pace. Your unfinished lists will be automatically saved here as drafts until you\u2019re ready to publish."
        : filter === "published"
          ? "Publish your first list to share it with the world. All your published content will be displayed here for easy access."
          : "Start creating your first list and share your ideas with the world. Your drafts and published lists will appear here.";

    return (
      <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md border border-dashed border-neutral-border px-6 py-12">
        <div className="flex flex-col items-center justify-center gap-2 px-2 py-2">
          {icon}
        </div>
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-heading-3 font-heading-3 text-default-font text-center">
            {heading}
          </span>
          <span className="max-w-[448px] text-body font-body text-subtext-color text-center">
            {description}
          </span>
        </div>
        <Button icon={<FeatherPlus />} onClick={handleCreateNewList}>
          Create new list
        </Button>
      </div>
    );
  };

  return (
      <div className="flex w-full flex-col items-start gap-6">
        {filteredLists.length === 0 ? (
          <div className="w-full">
            <EmptyState />
          </div>
        ) : (
          filteredLists.map((list) => (
            <ListRow key={list.id} list={list} isDraft={!list.is_published} />
          ))
        )}
        <ConfirmDeleteModal
          open={isConfirmOpen}
          onOpenChange={setIsConfirmOpen}
          onConfirm={async () => {
            if (!deleteTarget) return;
            const id = deleteTarget.id;
            await onDeleteList(id);
            setIsConfirmOpen(false);
            setDeleteTarget(null);
          }}
        />
      </div>
  );
}


