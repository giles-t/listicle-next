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
import NewListItemForm from "./NewListItemForm";
import RichTextEditor from "@/client/components/NotionEditor";
import { StaticContentRenderer } from "@/client/components/StaticContentRenderer";
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
};

export default function EditListClient({ listId, listType: initialType, isPublished, isVisible, title: initialTitle, description: initialDescription, items: initialItems, categories: initialCategories = [] }: Props) {
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false);
  const [isChangeTitleOpen, setIsChangeTitleOpen] = useState(false);
  const [isChangeCategoriesOpen, setIsChangeCategoriesOpen] = useState(false);
  const [isChangeVisibilityOpen, setIsChangeVisibilityOpen] = useState(false);
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
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  // NewListItemForm now manages its own open/close state

  const openChangeType = () => setIsChangeTypeOpen(true);
  const openChangeTitle = () => setIsChangeTitleOpen(true);
  const openChangeCategories = () => setIsChangeCategoriesOpen(true);
  const openChangeVisibility = () => setIsChangeVisibilityOpen(true);
  
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

  const renderItemContent = (item: ListItem) => {
    const isEditing = editingItemId === item.id;
    
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
            <Button size="small" onClick={handleSaveItem}>
              Save
            </Button>
            <Button variant="neutral-secondary" size="small" onClick={handleCancelEdit}>
              Cancel
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
    <div className="flex h-full w-full flex-col items-start bg-default-background">
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
                  <DropdownMenu.DropdownItem icon={<FeatherListRestart />}>Reorder List</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />} onClick={openChangeTitle}>Change title / subtitle</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTag />} onClick={openChangeCategories}>Change category</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherImage />}>Change cover image</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEye />} onClick={openChangeVisibility}>Manage list visibility</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherFilePlus />}>Add to publication</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownDivider />
                  <DropdownMenu.DropdownItem icon={<FeatherSettings2 />}>More settings</DropdownMenu.DropdownItem>
                </DropdownMenu>
              </SubframeCore.DropdownMenu.Content>
            </SubframeCore.DropdownMenu.Portal>
          </SubframeCore.DropdownMenu.Root>
          <Button onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}>Publish</Button>
        </div>
      </div>
      <div className="container max-w-none flex w-full flex-col items-start gap-12 bg-default-background py-12">
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            <h1 className="w-full text-heading-1 font-heading-1 text-default-font sm:text-4xl lg:text-5xl font-bold">{title}</h1>
            {description ? (
              <span className="w-full text-heading-3 font-heading-3 text-subtext-color">{description}</span>
            ) : null}
          </div>
        </div>
        <div className="flex w-full flex-col items-center gap-8 px-4">
          <div className="flex w-full max-w-[768px] flex-col items-start gap-4">
            {listType === "unordered" ? (
              <ul className="list-disc list-outside w-full">
                {items.map((item) => (
                  <li key={item.id} className="mb-4 list-item-heading-2">
                    <div className="flex items-center justify-between w-full mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-heading-2 font-heading-2 text-default-font font-bold">{item.title}</span>
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
              <ol className="list-decimal list-outside w-full" reversed>
                {items.map((item) => (
                    <li key={item.id} className="mb-4 list-item-heading-2">
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-heading-2 font-heading-2 text-default-font">{item.title}</span>
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
              <ol className="list-decimal list-outside w-full">
                {items.map((item) => (
                    <li key={item.id} className="mb-4 list-item-heading-2">
                      <div className="flex items-center justify-between w-full mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-heading-2 font-heading-2 text-default-font">{item.title}</span>
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
    </div>
  );
}
