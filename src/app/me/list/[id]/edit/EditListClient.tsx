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
import NewListItemForm from "./NewListItemForm";
import RichTextEditor from "@/client/components/NotionEditor";

type ListItem = { id: string; title: string; content: string; sort_order: number };
type Props = {
  listId: string;
  listType: ListType;
  isPublished: boolean;
  title: string;
  description: string | null;
  items: ListItem[];
};

export default function EditListClient({ listId, listType: initialType, isPublished, title, description, items: initialItems }: Props) {
  const [isChangeTypeOpen, setIsChangeTypeOpen] = useState(false);
  const [listType, setListType] = useState<ListType>(initialType);
  const [isSavingType, setIsSavingType] = useState(false);
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState<string>("");
  // NewListItemForm now manages its own open/close state

  const openChangeType = () => setIsChangeTypeOpen(true);
  
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
      setListType(newType);
      setIsChangeTypeOpen(false);
      toast.success("List type updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to update list type");
    } finally {
      setIsSavingType(false);
    }
  };

  const renderItemContent = (item: ListItem) => {
    const isEditing = editingItemId === item.id;
    
    if (isEditing) {
      return (
        <div className="w-full space-y-3">
          <RichTextEditor
            value={editingContent}
            onChange={setEditingContent}
            placeholder="Write details…"
            className="w-full min-h-[200px]"
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
      <>
        {item.content ? (
          <div
            className="tiptap max-w-none cursor-pointer hover:bg-neutral-50 py-2 rounded transition-colors"
            onClick={() => handleEditItem(item)}
            dangerouslySetInnerHTML={{ __html: item.content }}
          />
        ) : (
          <div 
            className="text-subtext-color italic cursor-pointer hover:bg-neutral-50 py-2 rounded transition-colors"
            onClick={() => handleEditItem(item)}
          >
            Click to add details...
          </div>
        )}
      </>
    );
  };

  return (
    <div className="flex h-full w-full flex-col items-start bg-default-background">
      <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3">
        <div className="flex grow shrink-0 basis-0 items-center gap-2">
          <Button
            variant="neutral-tertiary"
            icon={<FeatherArrowLeft />}
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {}}
          >
            Back
          </Button>
          <Badge variant={isPublished ? "success" : "neutral"}>{isPublished ? "Published" : "Draft"}</Badge>
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
                  <DropdownMenu.DropdownItem icon={<FeatherEdit2 />}>Change title / subtitle</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherTag />}>Change category</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherImage />}>Change cover image</DropdownMenu.DropdownItem>
                  <DropdownMenu.DropdownItem icon={<FeatherEye />}>Manage list visibility</DropdownMenu.DropdownItem>
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
            <span className="w-full text-heading-1 font-heading-1 text-default-font">{title}</span>
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
                  <li key={item.id} className="mb-4 marker:text-heading-2 marker:font-heading-2 marker:text-default-font">
                    <div className="flex items-center justify-between w-full mb-2">
                      <span className="text-heading-2 font-heading-2 text-default-font">{item.title}</span>
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
                {[...items]
                  .sort((a, b) => b.sort_order - a.sort_order)
                  .map((item) => (
                    <li key={item.id} className="mb-4 marker:text-heading-2 marker:font-heading-2 marker:text-default-font">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-heading-2 font-heading-2 text-default-font">{item.title}</span>
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
                {items
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((item) => (
                    <li key={item.id} className="mb-4 marker:text-heading-2 marker:font-heading-2 marker:text-default-font">
                      <div className="flex items-center justify-between w-full mb-2">
                        <span className="text-heading-2 font-heading-2 text-default-font">{item.title}</span>
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
      />
    </div>
  );
}


