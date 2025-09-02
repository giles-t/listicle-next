"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/ui/components/Button";
import { Tabs } from "@/ui/components/Tabs";
import { IconWithBackground } from "@/ui/components/IconWithBackground";
import { Badge } from "@/ui/components/Badge";
import { Avatar } from "@/ui/components/Avatar";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { Loader } from "@/ui/components/Loader";
import * as SubframeCore from "@subframe/core";
import { FeatherEye, FeatherFileText, FeatherMoreHorizontal, FeatherEdit2, FeatherTrash } from "@subframe/core";
import { formatRelativeTime, formatShortDate } from "@/shared/utils/date";
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

  const ListRow: React.FC<{ list: UserList; isDraft: boolean }> = ({ list, isDraft }) => {
    const editHref = `/me/list/${list.id}/edit`;

    return (
      <div className="flex w-full items-start gap-4 rounded-md border border-solid border-neutral-border bg-default-background px-4 py-4 mobile:flex-col mobile:flex-nowrap mobile:gap-4">
        {list.cover_image ? (
          <Link href={editHref} className="flex-none">
            <img
              className="h-20 w-20 rounded-sm object-cover cursor-pointer"
              src={list.cover_image}
              alt={list.title}
            />
          </Link>
        ) : (
          <Link
            href={editHref}
            className="h-20 w-20 flex-none rounded-sm bg-neutral-100 flex items-center justify-center cursor-pointer"
            aria-label="Edit list"
          >
            <FeatherFileText className="w-6 h-6 text-neutral-400" />
          </Link>
        )}
        <div className="flex flex-col items-start justify-center gap-2 self-stretch grow">
          <div className="flex flex-col items-start gap-1">
            <Link href={editHref} className="text-body-bold font-body-bold text-default-font cursor-pointer hover:underline">
              {list.title}
            </Link>
            <span className="text-caption font-caption text-subtext-color">
              {isDraft
                ? `Created ${isClient ? formatRelativeTime(list.created_at) : formatShortDate(list.created_at)}`
                : `Published ${isClient ? formatRelativeTime(list.published_at || list.created_at) : formatShortDate(list.published_at || list.created_at)}`}
            </span>
          </div>
          {list.description ? (
            <Link href={editHref} className="text-body font-body text-subtext-color line-clamp-2 cursor-pointer">
              {list.description}
            </Link>
          ) : null}
        </div>
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2 self-stretch mobile:items-center mobile:justify-start">
          <Badge variant={isDraft ? "neutral" : "success"}>{isDraft ? "Draft" : "Published"}</Badge>
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <IconButton icon={<FeatherMoreHorizontal />} loading={isDeleting === list.id} />
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
                <DropdownMenu>
                 {isDraft ? (
                  <>
                    <DropdownMenu.DropdownItem icon={<FeatherEdit2 />} onClick={() => handleEditList(list.id)}>
                      Edit Draft
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      className="text-error-700"
                      icon={<FeatherTrash className="text-error-700" />}
                      onClick={() => requestDelete(list)}
                    >
                      <span className="text-error-700">Delete Draft</span>
                    </DropdownMenu.DropdownItem>
                  </>
                ) : (
                  <>
                    <DropdownMenu.DropdownItem icon={<FeatherEye />} onClick={() => router.push(`/@${profile.username || "user"}/${list.slug}`)}>
                      View List
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem icon={<FeatherEdit2 />} onClick={() => handleEditList(list.id)}>
                      Edit List
                    </DropdownMenu.DropdownItem>
                    <DropdownMenu.DropdownItem
                      className="text-error-700"
                      icon={<FeatherTrash className="text-error-700" />}
                      onClick={() => requestDelete(list)}
                    >
                      <span className="text-error-700">Delete List</span>
                    </DropdownMenu.DropdownItem>
                  </>
                )}
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
        </div>
      </div>
    );
  };

  const EmptyState: React.FC<{ isDraft: boolean }> = ({ isDraft }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4">
        <IconWithBackground variant="neutral" size="large" square={true} />
      </div>
      <h3 className="text-heading-3 font-heading-3 text-default-font mb-2">
        {filter === "all" ? "No lists yet" : isDraft ? "No draft lists yet" : "No published lists yet"}
      </h3>
      <p className="text-body font-body text-subtext-color mb-6 max-w-md">
        {filter === "all"
          ? "Start creating your first list and save it as a draft to work on later."
          : isDraft
          ? "Start creating your first list and save it as a draft to work on later."
          : "Publish your first list to share it with the world."}
      </p>
      <Button onClick={handleCreateNewList}>Create new list</Button>
    </div>
  );

  return (
      <div className="flex w-full flex-col items-start gap-4">
        {filteredLists.length === 0 ? (
          <div className="w-full">
            <EmptyState isDraft={filter === "drafts"} />
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
            setIsConfirmOpen(false);
            await onDeleteList(id);
            setDeleteTarget(null);
          }}
        />
      </div>
  );
}


