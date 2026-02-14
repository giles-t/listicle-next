"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button } from "@/ui/components/Button";
import { Badge } from "@/ui/components/Badge";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import * as SubframeCore from "@subframe/core";
import {
  FeatherArrowLeft,
  FeatherList,
  FeatherListRestart,
  FeatherImage,
  FeatherEye,
  FeatherFilePlus,
  FeatherSettings2,
  FeatherSettings,
  toast,
} from "@subframe/core";
import ChangeListTypeModal, { type ListType } from "./ChangeListTypeModal";
import ChangeListVisibilityModal from "./ChangeListVisibilityModal";
import ReorderListModal from "./ReorderListModal";
import MoreSettingsModal from "./MoreSettingsModal";
import ChangeCoverImageModal from "./ChangeCoverImageModal";
import AddToPublicationModal from "./AddToPublicationModal";
import NewListItemForm from "./NewListItemForm";
import InlineEditableTitle from "./InlineEditableTitle";
import InlineEditableDescription from "./InlineEditableDescription";
import InlineItemContent from "./InlineItemContent";
import { extractImagesFromListItems } from "@/shared/utils/extract-images";
import Link from "next/link";

type ListItem = { id: string; title: string; content: string; sort_order: number };
type Category = { id: string; name: string; };
type Props = {
  listId: string;
  listType: ListType;
  isPublished: boolean;
  isVisible: boolean;
  title: string;
  description: string | null;
  items: ListItem[];
  categories?: Category[];
  isPinned?: boolean;
  allowComments?: boolean;
  seoTitle?: string;
  seoDescription?: string;
  coverImage?: string;
  publicationId?: string | null;
  slug: string;
  username: string;
};

function EditListItem({
  item,
  listId,
  isActive,
  onActivate,
  onDeactivate,
  onContentChange,
}: {
  item: ListItem;
  listId: string;
  isActive: boolean;
  onActivate: (itemId: string) => void;
  onDeactivate: () => void;
  onContentChange: (itemId: string, newContent: string) => void;
}) {
  return (
    <li className="list-item-marker">
      <div className="w-full mb-4">
        <h2 className="text-heading-2 font-heading-2 text-default-font font-bold">
          {item.title}
        </h2>
      </div>
      <InlineItemContent
        item={item}
        listId={listId}
        isActive={isActive}
        onActivate={onActivate}
        onDeactivate={onDeactivate}
        onContentChange={onContentChange}
      />
    </li>
  );
}

export default function EditListClient({
  listId,
  listType: initialType,
  isPublished,
  isVisible,
  title: initialTitle,
  description: initialDescription,
  items: initialItems,
  categories: initialCategories = [],
  isPinned: initialIsPinned = false,
  allowComments: initialAllowComments = false,
  seoTitle: initialSeoTitle = "",
  seoDescription: initialSeoDescription = "",
  coverImage: initialCoverImage,
  publicationId: initialPublicationId = null,
  slug,
  username
}: Props) {
  // Modal states
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false);
  const [isChangeVisibilityOpen, setIsChangeVisibilityOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isMoreSettingsOpen, setIsMoreSettingsOpen] = useState(false);
  const [isChangeCoverImageOpen, setIsChangeCoverImageOpen] = useState(false);
  const [isAddToPublicationOpen, setIsAddToPublicationOpen] = useState(false);

  // List data state
  const [listType, setListType] = useState<ListType>(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [publishedState, setPublishedState] = useState(isPublished);
  const [visibleState, setVisibleState] = useState(isVisible);
  const [items, setItems] = useState<ListItem[]>(initialItems);

  // Inline editing state
  const [titleActive, setTitleActive] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [descriptionActive, setDescriptionActive] = useState(false);

  // Settings state
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [allowComments, setAllowComments] = useState(initialAllowComments);
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [publicationId, setPublicationId] = useState(initialPublicationId);

  // Modal saving states
  const [isSavingType, setIsSavingType] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingCoverImage, setIsSavingCoverImage] = useState(false);
  const [isSavingPublication, setIsSavingPublication] = useState(false);
  const [isSavingPublish, setIsSavingPublish] = useState(false);

  // Safety net: reset body pointer-events when all modals are closed.
  // Works around a Radix DismissableLayer race condition where the shared
  // module-level `originalBodyPointerEvents` variable can capture "none"
  // when a DropdownMenu and Dialog overlap during open/close transitions.
  const anyModalOpen = isChangeTypeOpen || isChangeVisibilityOpen || isReorderOpen || isMoreSettingsOpen || isChangeCoverImageOpen || isAddToPublicationOpen;
  useEffect(() => {
    if (!anyModalOpen) {
      // Allow Radix cleanup effects to run first, then verify
      const id = requestAnimationFrame(() => {
        if (document.body.style.pointerEvents === "none") {
          document.body.style.pointerEvents = "";
        }
      });
      return () => cancelAnimationFrame(id);
    }
  }, [anyModalOpen]);

  // Extract available images from list items
  const availableImages = extractImagesFromListItems(items);

  // Inline editing handlers
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle);
  }, []);

  const handleDescriptionChange = useCallback((newDescription: string | null) => {
    setDescription(newDescription);
  }, []);

  const handleTitleActivate = useCallback(() => {
    setTitleActive(true);
  }, []);

  const handleTitleDeactivate = useCallback(() => {
    setTitleActive(false);
  }, []);

  const handleDescriptionActivate = useCallback(() => {
    setDescriptionActive(true);
  }, []);

  const handleDescriptionDeactivate = useCallback(() => {
    setDescriptionActive(false);
  }, []);

  const handleItemContentChange = useCallback((itemId: string, newContent: string) => {
    setItems((prev) => prev.map((it) => it.id === itemId ? { ...it, content: newContent } : it));
  }, []);

  const handleItemActivate = useCallback((itemId: string) => {
    setActiveItemId(itemId);
  }, []);

  const handleItemDeactivate = useCallback(() => {
    setActiveItemId(null);
  }, []);

  // Modal handlers
  const handleConfirmChangeType = async (newType: ListType) => {
    if (!listId) return;
    try {
      setIsSavingType(true);
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ list_type: newType }),
      });
      if (!res.ok) throw new Error("Failed to update list type");

      const itemsRes = await fetch(`/api/lists/${listId}/items?order=${newType === "reversed" ? "desc" : "asc"}`, {
        credentials: "include",
      });
      if (itemsRes.ok) {
        const { items: updatedItems } = await itemsRes.json();
        setItems(updatedItems);
      }

      setListType(newType);
      setIsChangeTypeOpen(false);
      toast.success("List type updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update list type");
    } finally {
      setIsSavingType(false);
    }
  };

  const handleConfirmChangeVisibility = async (isVisible: boolean) => {
    if (!listId) return;
    try {
      setIsSavingVisibility(true);
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_visible: isVisible }),
      });
      if (!res.ok) throw new Error("Failed to update visibility");

      setVisibleState(isVisible);
      setIsChangeVisibilityOpen(false);
      toast.success(`List is now ${isVisible ? "visible" : "hidden"}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update visibility");
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const handleConfirmReorder = async (reorderedItems: ListItem[]) => {
    if (!listId) return;
    try {
      setIsSavingReorder(true);
      const res = await fetch(`/api/lists/${listId}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ items: reorderedItems.map(item => ({ id: item.id, sort_order: item.sort_order })) }),
      });
      if (!res.ok) throw new Error("Failed to reorder list items");
      setItems(reorderedItems);
      setIsReorderOpen(false);
      toast.success("List items reordered successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to reorder list items");
    } finally {
      setIsSavingReorder(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!listId) return;
    try {
      setIsSavingSettings(true);
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          is_pinned: isPinned,
          allow_comments: allowComments,
          seo_title: seoTitle,
          seo_description: seoDescription
        }),
      });
      if (!res.ok) throw new Error("Failed to update settings");

      setIsMoreSettingsOpen(false);
      toast.success("Settings updated successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update settings");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleConfirmChangeCoverImage = async (imageUrl: string) => {
    if (!listId) return;
    try {
      setIsSavingCoverImage(true);
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ cover_image: imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to update cover image");

      setCoverImage(imageUrl);
      setIsChangeCoverImageOpen(false);
      toast.success("Cover image updated successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update cover image");
    } finally {
      setIsSavingCoverImage(false);
    }
  };

  const handleConfirmAddToPublication = async (newPublicationId: string) => {
    if (!listId) return;
    try {
      setIsSavingPublication(true);
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ publication_id: newPublicationId }),
      });
      if (!res.ok) throw new Error("Failed to update publication");

      setPublicationId(newPublicationId);
      setIsAddToPublicationOpen(false);
      toast.success("List added to publication successfully");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add to publication");
    } finally {
      setIsSavingPublication(false);
    }
  };

  const handlePublish = async () => {
    if (!listId) return;
    try {
      setIsSavingPublish(true);
      const newPublishedState = !publishedState;
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ is_published: newPublishedState }),
      });
      if (!res.ok) throw new Error(`Failed to ${newPublishedState ? "publish" : "unpublish"} list`);

      const data = await res.json();
      setPublishedState(newPublishedState);

      toast.success(`List ${newPublishedState ? "published" : "unpublished"} successfully`);

      if (newPublishedState && data.autoCategorization?.applied) {
        const categoryNames = data.autoCategorization.categories.map((c: any) => c.name).join(", ");
        toast.success(`Auto-categorized as: ${categoryNames}`);
        setCategories(data.autoCategorization.categories);
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update publish status");
    } finally {
      setIsSavingPublish(false);
    }
  };

  const renderListItems = (itemsList: ListItem[]) =>
    itemsList.map((item) => (
      <EditListItem
        key={item.id}
        item={item}
        listId={listId}
        isActive={activeItemId === item.id}
        onActivate={handleItemActivate}
        onDeactivate={handleItemDeactivate}
        onContentChange={handleItemContentChange}
      />
    ));

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background page-scalable text-lg">
      {/* Toolbar */}
      <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          <Link href="/me/lists">
            <Button
              variant="neutral-tertiary"
              icon={<FeatherArrowLeft />}
            >
              Back
            </Button>
          </Link>
          <Badge variant={publishedState ? "success" : "neutral"}>
            {publishedState ? "Published" : "Draft"}
          </Badge>
        </div>
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
          {publishedState && (
            <Link href={`/@${username}/${slug}`} target="_blank">
              <Button
                variant="neutral-secondary"
                icon={<FeatherEye />}
              >
                View
              </Button>
            </Link>
          )}
          <SubframeCore.DropdownMenu.Root>
            <SubframeCore.DropdownMenu.Trigger asChild={true}>
              <Button
                variant="neutral-tertiary"
                icon={<FeatherSettings />}
                onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
              />
            </SubframeCore.DropdownMenu.Trigger>
            <SubframeCore.DropdownMenu.Portal>
              <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
                <DropdownMenu>
                  <DropdownMenu.DropdownItem icon={<FeatherList />} onClick={() => requestAnimationFrame(() => setIsChangeTypeOpen(true))}>
                    Change list type
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherListRestart />} onClick={() => requestAnimationFrame(() => setIsReorderOpen(true))}>
                    Reorder List
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherImage />} onClick={() => requestAnimationFrame(() => setIsChangeCoverImageOpen(true))}>
                    Change cover image
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEye />} onClick={() => requestAnimationFrame(() => setIsChangeVisibilityOpen(true))}>
                    Manage list visibility
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherFilePlus />} onClick={() => requestAnimationFrame(() => setIsAddToPublicationOpen(true))}>
                    Add to publication
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownDivider />
                  <DropdownMenu.DropdownItem icon={<FeatherSettings2 />} onClick={() => requestAnimationFrame(() => setIsMoreSettingsOpen(true))}>
                    More settings
                  </DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
          <Button onClick={handlePublish} loading={isSavingPublish}>
            {publishedState ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="container max-w-none flex w-full flex-col items-start gap-12 bg-default-background py-12">
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-6">
            <InlineEditableTitle
              initialValue={title}
              listId={listId}
              isActive={titleActive}
              onActivate={handleTitleActivate}
              onDeactivate={handleTitleDeactivate}
              onTitleChange={handleTitleChange}
            />
            <InlineEditableDescription
              initialValue={description}
              listId={listId}
              isActive={descriptionActive}
              onActivate={handleDescriptionActivate}
              onDeactivate={handleDescriptionDeactivate}
              onDescriptionChange={handleDescriptionChange}
            />
          </div>
        </div>

        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            {listType === "unordered" ? (
              <ul className="list-disc list-outside w-full flex flex-col gap-12">
                {renderListItems(items)}
              </ul>
            ) : (
              <ol
                className="list-decimal list-outside w-full flex flex-col gap-12"
                reversed={listType === "reversed"}
              >
                {renderListItems(items)}
              </ol>
            )}
          </div>
        </div>

        <NewListItemForm
          listId={listId}
          onAdded={(item) => {
            setItems((prev) => [...prev, item]);
          }}
        />
      </div>

      {/* Modals */}
      <ChangeListTypeModal
        open={isChangeTypeOpen}
        onOpenChange={setIsChangeTypeOpen}
        initialValue={listType}
        onConfirm={handleConfirmChangeType}
        loading={isSavingType}
      />
      <ChangeListVisibilityModal
        open={isChangeVisibilityOpen}
        onOpenChange={setIsChangeVisibilityOpen}
        initialIsVisible={visibleState}
        onConfirm={handleConfirmChangeVisibility}
        loading={isSavingVisibility}
      />
      <ReorderListModal
        open={isReorderOpen}
        onOpenChange={setIsReorderOpen}
        items={items}
        onConfirm={handleConfirmReorder}
        loading={isSavingReorder}
      />
      <MoreSettingsModal
        open={isMoreSettingsOpen}
        onOpenChange={setIsMoreSettingsOpen}
        isPinned={isPinned}
        onPinnedChange={setIsPinned}
        allowComments={allowComments}
        onAllowCommentsChange={setAllowComments}
        seoTitle={seoTitle}
        onSeoTitleChange={setSeoTitle}
        seoDescription={seoDescription}
        onSeoDescriptionChange={setSeoDescription}
        onSave={handleSaveSettings}
        loading={isSavingSettings}
      />
      <ChangeCoverImageModal
        open={isChangeCoverImageOpen}
        onOpenChange={setIsChangeCoverImageOpen}
        currentCoverImage={coverImage}
        availableImages={availableImages}
        onConfirm={handleConfirmChangeCoverImage}
        loading={isSavingCoverImage}
      />
      <AddToPublicationModal
        open={isAddToPublicationOpen}
        onOpenChange={setIsAddToPublicationOpen}
        currentPublicationId={publicationId}
        onConfirm={handleConfirmAddToPublication}
        loading={isSavingPublication}
      />
    </div>
  );
}
