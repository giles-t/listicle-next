"use client";

import React, { useState } from "react";
import { Button } from "@/ui/components/Button";
import { Badge } from "@/ui/components/Badge";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import * as SubframeCore from "@subframe/core";
import {
  FeatherArrowLeft,
  FeatherList,
  FeatherListRestart,
  FeatherEdit2,
  FeatherTag,
  FeatherImage,
  FeatherEye,
  FeatherFilePlus,
  FeatherSettings2,
  FeatherSettings,
  toast,
} from "@subframe/core";
import ChangeListTypeModal, { type ListType } from "./ChangeListTypeModal";
import ChangeListTitleModal from "./ChangeListTitleModal";
import ChangeListCategoriesModal from "./ChangeListCategoriesModal";
import ChangeListVisibilityModal from "./ChangeListVisibilityModal";
import ReorderListModal from "./ReorderListModal";
import MoreSettingsModal from "./MoreSettingsModal";
import ChangeCoverImageModal from "./ChangeCoverImageModal";
import AddToPublicationModal from "./AddToPublicationModal";
import NewListItemForm from "./NewListItemForm";
import RichTextEditor from "@/client/components/NotionEditor";
// import { StaticContentRenderer } from "@/server/components/StaticContentRenderer";
import { StaticContentRenderer } from "@/client/components/StaticContentRenderer";
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
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false);
  const [isChangeTitleOpen, setIsChangeTitleOpen] = useState(false);
  const [isChangeCategoriesOpen, setIsChangeCategoriesOpen] = useState(false);
  const [isChangeVisibilityOpen, setIsChangeVisibilityOpen] = useState(false);
  const [isReorderOpen, setIsReorderOpen] = useState(false);
  const [isMoreSettingsOpen, setIsMoreSettingsOpen] = useState(false);
  const [isChangeCoverImageOpen, setIsChangeCoverImageOpen] = useState(false);
  const [isAddToPublicationOpen, setIsAddToPublicationOpen] = useState(false);
  const [listType, setListType] = useState<ListType>(initialType);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [publishedState, setPublishedState] = useState(isPublished);
  const [visibleState, setVisibleState] = useState(isVisible);
  const [isSavingType, setIsSavingType] = useState(false);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSavingCategories, setIsSavingCategories] = useState(false);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const [isSavingReorder, setIsSavingReorder] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  // More settings state
  const [isPinned, setIsPinned] = useState(initialIsPinned);
  const [allowComments, setAllowComments] = useState(initialAllowComments);
  const [seoTitle, setSeoTitle] = useState(initialSeoTitle);
  const [seoDescription, setSeoDescription] = useState(initialSeoDescription);
  const [coverImage, setCoverImage] = useState(initialCoverImage);
  const [publicationId, setPublicationId] = useState(initialPublicationId);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingCoverImage, setIsSavingCoverImage] = useState(false);
  const [isSavingPublication, setIsSavingPublication] = useState(false);
  const [isSavingPublish, setIsSavingPublish] = useState(false);
  // NewListItemForm now manages its own open/close state

  const openChangeType = () => setIsChangeTypeOpen(true);
  const openChangeTitle = () => setIsChangeTitleOpen(true);
  const openChangeCategories = () => setIsChangeCategoriesOpen(true);
  const openChangeVisibility = () => setIsChangeVisibilityOpen(true);
  const openReorder = () => setIsReorderOpen(true);
  const openMoreSettings = () => setIsMoreSettingsOpen(true);
  const openChangeCoverImage = () => setIsChangeCoverImageOpen(true);
  const openAddToPublication = () => setIsAddToPublicationOpen(true);
  
  // Extract available images from list items
  const availableImages = extractImagesFromListItems(items);
  
  const handleEditItem = (item: ListItem) => {
    setEditingItemId(item.id);
    setEditingContent(item.content || "");
  };
  
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingContent("");
  };
  
  const handleSaveItem = async () => {
    if (!editingItemId) return;
    
    try {
      if (isSavingItem) return;
      setIsSavingItem(true);
      const res = await fetch(`/api/lists/${listId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id: editingItemId, content: editingContent }),
      });
      if (!res.ok) throw new Error("Failed to update item");
      
      // Update local state
      setItems((prev) => prev.map((it) => (it.id === editingItemId ? { ...it, content: editingContent } : it)));
      setEditingItemId(null);
      setEditingContent("");
      toast.success("Item updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update item");
    } finally {
      setIsSavingItem(false);
    }
  };
  
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
      
      // Fetch items in the correct order for the new list type
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

  const handleConfirmChangeTitle = async (newTitle: string, newSubtitle: string | null) => {
    if (!listId) return;
    try {
      setIsSavingTitle(true);
      const res = await fetch(`/api/lists/${listId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: newTitle, description: newSubtitle }),
      });
      if (!res.ok) throw new Error("Failed to update title and subtitle");
      
      setTitle(newTitle);
      setDescription(newSubtitle);
      setIsChangeTitleOpen(false);
      toast.success("Title and subtitle updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update title and subtitle");
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleConfirmChangeCategories = async (newCategories: Category[]) => {
    if (!listId) return;
    try {
      setIsSavingCategories(true);
      const res = await fetch(`/api/lists/${listId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ tags: newCategories }),
      });
      if (!res.ok) throw new Error("Failed to update categories");
      
      setCategories(newCategories);
      setIsChangeCategoriesOpen(false);
      toast.success("Categories updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update categories");
    } finally {
      setIsSavingCategories(false);
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
      
      setPublishedState(newPublishedState);
      toast.success(`List ${newPublishedState ? "published" : "unpublished"} successfully`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update publish status");
    } finally {
      setIsSavingPublish(false);
    }
  };

  const renderItemContent = (item: ListItem) => {
    const isEditing = editingItemId === item.id;
    const hasContent = item.content && item.content.trim() !== '';
    
    if (isEditing) {
      return (
        <div className="w-full space-y-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <RichTextEditor
            value={editingContent}
            onChange={setEditingContent}
            placeholder="Write details…"
            className="w-full"
          />
          <div className="flex items-center gap-2">
            <Button size="small" onClick={handleSaveItem} loading={isSavingItem}>
              Save
            </Button>
            <Button variant="neutral-secondary" size="small" onClick={handleCancelEdit} disabled={isSavingItem}>
              Cancel
            </Button>
          </div>
        </div>
      );
    }
    
    if (!hasContent) {
      return (
        <div className="w-full flex items-center justify-center gap-3 border-2 border-dashed border-neutral-border rounded-lg p-8 bg-neutral-50 hover:bg-neutral-100 transition-colors">
          <div className="flex flex-col items-center gap-3">
            <span className="text-subheader-3 font-subheader-3 text-neutral-400">No details added yet</span>
            <Button
              variant="neutral-secondary"
              size="small"
              icon={<FeatherEdit2 />}
              onClick={() => handleEditItem(item)}
            >
              Add details
            </Button>
          </div>
        </div>
      );
    }
    
    return (
      <StaticContentRenderer 
        content={item.content} 
        emptyMessage="No details added yet..."
      />
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background page-scalable text-lg">
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
          <Badge variant={publishedState ? "success" : "neutral"}>{publishedState ? "Published" : "Draft"}</Badge>
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
                  <DropdownMenu.DropdownItem icon={<FeatherList />} onClick={openChangeType}>
                    Change list type
                  </DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherListRestart />} onClick={openReorder}>Reorder List</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />} onClick={openChangeTitle}>Change title / subtitle</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTag />} onClick={openChangeCategories}>Change category</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherImage />} onClick={openChangeCoverImage}>Change cover image</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEye />} onClick={openChangeVisibility}>Manage list visibility</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherFilePlus />} onClick={openAddToPublication}>Add to publication</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownDivider />
                  <DropdownMenu.DropdownItem icon={<FeatherSettings2 />} onClick={openMoreSettings}>More settings</DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
          <Button onClick={handlePublish} loading={isSavingPublish}>
            {publishedState ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>
      <div className="container max-w-none flex w-full flex-col items-start gap-12 bg-default-background py-12">
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <h1 className="w-full text-heading-1 font-heading-1 text-default-font font-bold">{title}</h1>
            {description ? (
              <span className="w-full description-text">{description}</span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            {listType === "unordered" ? (
              <ul className="list-disc list-outside w-full flex flex-col gap-12">
                {items.map((item) => (
                  <li key={item.id} className="list-item-marker">
                    <div className="flex items-center justify-between w-full mb-4">
                      <div className="flex items-center gap-2">
                        <h2 className="text-heading-2 font-heading-2 text-default-font font-bold">{item.title}</h2>
                        {editingItemId === item.id && (
                          <Badge variant="brand">Editing</Badge>
                        )}
                      </div>
                      {editingItemId !== item.id && (
                        <Button
                          variant="neutral-tertiary"
                          size="small"
                          icon={<FeatherEdit2 />}
                          onClick={() => handleEditItem(item)}
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    {renderItemContent(item)}
                  </li>
                ))}
              </ul>
            ) : listType === "reversed" ? (
              <ol className="list-decimal list-outside w-full flex flex-col gap-12" reversed>
                {items.map((item) => (
                    <li key={item.id} className="list-item-marker">
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-2">
                          <h2 className="text-heading-2 font-heading-2 text-default-font font-bold">{item.title}</h2>
                          {editingItemId === item.id && (
                            <Badge variant="brand">Editing</Badge>
                          )}  
                        </div>
                        {editingItemId !== item.id && (
                          <Button
                            variant="neutral-tertiary"
                            size="small"
                            icon={<FeatherEdit2 />}
                            onClick={() => handleEditItem(item)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      {renderItemContent(item)}
                    </li>
                  ))}
              </ol>
            ) : (
              <ol className="list-decimal list-outside w-full flex flex-col gap-12">
                {items.map((item) => (
                    <li key={item.id} className="list-item-marker">
                      <div className="flex items-center justify-between w-full mb-4">
                        <div className="flex items-center gap-2">
                          <h2 className="text-heading-2 font-heading-2 text-default-font font-bold">{item.title}</h2>
                          {editingItemId === item.id && (
                            <Badge variant="brand">Editing</Badge>
                          )}
                        </div>
                        {editingItemId !== item.id && (
                          <Button
                            variant="neutral-tertiary"
                            size="small"
                            icon={<FeatherEdit2 />}
                            onClick={() => handleEditItem(item)}
                          >
                            Edit
                          </Button>
                        )}
                      </div>
                      {renderItemContent(item)}
                    </li>
                  ))}
              </ol>
            )}
          </div>
        </div>
        {!editingItemId && (
          <NewListItemForm
            listId={listId}
            onAdded={(item) => {
              setItems((prev) => [...prev, item]);
            }}
          />
        )}
      </div>
      <ChangeListTypeModal
        open={isChangeTypeOpen}
        onOpenChange={setIsChangeTypeOpen}
        initialValue={listType}
        onConfirm={handleConfirmChangeType}
        loading={isSavingType}
      />
      <ChangeListTitleModal
        open={isChangeTitleOpen}
        onOpenChange={setIsChangeTitleOpen}
        initialTitle={title}
        initialSubtitle={description}
        onConfirm={handleConfirmChangeTitle}
        loading={isSavingTitle}
      />
      <ChangeListCategoriesModal
        open={isChangeCategoriesOpen}
        onOpenChange={setIsChangeCategoriesOpen}
        initialCategories={categories}
        onConfirm={handleConfirmChangeCategories}
        loading={isSavingCategories}
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
