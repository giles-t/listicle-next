"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/ui/components/Badge";
import { Button } from "@/ui/components/Button";
import { IconButton } from "@/ui/components/IconButton";
import { Drawer } from "@/ui/components/Drawer";
import { FeatherGripVertical, FeatherChevronUp, FeatherChevronDown } from "@subframe/core";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ListItem = {
  id: string;
  title: string;
  content: string;
  sort_order: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ListItem[];
  onConfirm: (reorderedItems: ListItem[]) => void;
  loading?: boolean;
};

type SortableItemProps = {
  item: ListItem;
  index: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
};

function SortableItem({ item, index, onMoveUp, onMoveDown, isFirst, isLast, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex w-full items-center gap-4 border-b border-solid border-neutral-border px-4 py-4 ${isDragging ? 'z-50' : ''}`}
    >
      <div className="flex items-center gap-2">
        <IconButton
          size="small"
          variant="neutral-tertiary"
          icon={<FeatherChevronUp />}
          onClick={onMoveUp}
          disabled={isFirst || disabled}
        />
        <IconButton
          size="small"
          variant="neutral-tertiary"
          icon={<FeatherChevronDown />}
          onClick={onMoveDown}
          disabled={isLast || disabled}
        />
        <IconButton
          size="small"
          icon={<FeatherGripVertical />}
          className="cursor-grab active:cursor-grabbing"
          disabled={disabled}
          {...attributes}
          {...listeners}
        />
      </div>
      <Badge variant="neutral">{index + 1}</Badge>
      <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font">
        {item.title}
      </span>
    </div>
  );
}

export default function ReorderListModal({ 
  open, 
  onOpenChange, 
  items, 
  onConfirm, 
  loading = false 
}: Props) {
  const [reorderedItems, setReorderedItems] = useState<ListItem[]>([]);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Reset items when modal opens
  useEffect(() => {
    if (open) {
      // Sort items by current sort_order to ensure proper initial order
      const sortedItems = [...items].sort((a, b) => a.sort_order - b.sort_order);
      setReorderedItems(sortedItems);
    }
  }, [open, items]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const newItems = [...reorderedItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newItems.length) {
      // Swap the items
      [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
      setReorderedItems(newItems);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setReorderedItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleConfirm = () => {
    // Update sort_order based on new position
    const itemsWithNewOrder = reorderedItems.map((item, index) => ({
      ...item,
      sort_order: index + 1
    }));
    onConfirm(itemsWithNewOrder);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} className="items-end">
      <Drawer.Content onInteractOutside={(event) => event.preventDefault()}>
        <div className="absolute inset-0 flex max-w-[576px] flex-col ml-auto">
        {/* Header - Fixed */}
        <div className="flex w-full items-center gap-2 border-b border-solid border-neutral-border px-4 py-3 flex-shrink-0 bg-default-background">
          <span className="text-heading-3 font-heading-3 text-default-font">
            Reorder list items
          </span>
          <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
            <Button
              variant="neutral-tertiary"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              loading={loading}
              disabled={loading}
            >
              Save order
            </Button>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-default-background">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={reorderedItems.map(item => item.id)}
              strategy={verticalListSortingStrategy}
            >
              {reorderedItems.map((item, index) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  index={index}
                  onMoveUp={() => moveItem(index, 'up')}
                  onMoveDown={() => moveItem(index, 'down')}
                  isFirst={index === 0}
                  isLast={index === reorderedItems.length - 1}
                  disabled={loading}
                />
              ))}
            </SortableContext>
          </DndContext>
          <div className="h-4" /> {/* Bottom padding */}
        </div>
        </div>
      </Drawer.Content>
    </Drawer>
  );
}
