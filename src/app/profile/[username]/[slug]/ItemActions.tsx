"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { DropdownMenu } from "@/ui/components/DropdownMenu";
import { IconButton } from "@/ui/components/IconButton";
import { 
  FeatherBookmark, 
  FeatherCopy, 
  FeatherHeart, 
  FeatherMoreHorizontal, 
  FeatherShare2, 
  FeatherSmile, 
  FeatherThumbsUp, 
  FeatherTrophy 
} from "@subframe/core";
import * as SubframeCore from "@subframe/core";

interface ItemActionsProps {
  itemId: string;
}

export function ItemActions({ itemId }: ItemActionsProps) {
  return (
    <div className="flex w-full items-start justify-between border border-solid border-neutral-border px-1 py-1">
      <div className="flex items-center gap-2">
        <Button
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherSmile />}
          onClick={() => console.log('React to item:', itemId)}
        />
        <Button
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherHeart />}
          onClick={() => console.log('Heart item:', itemId)}
        />
        <Button
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherThumbsUp />}
          onClick={() => console.log('Thumbs up item:', itemId)}
        />
        <Button
          variant="neutral-tertiary"
          size="small"
          icon={<FeatherTrophy />}
          onClick={() => console.log('Trophy item:', itemId)}
        />
      </div>
      <div className="flex items-center gap-2">
        <IconButton
          size="small"
          icon={<FeatherBookmark />}
          onClick={() => console.log('Bookmark item:', itemId)}
        />
        <IconButton
          size="small"
          icon={<FeatherShare2 />}
          onClick={() => console.log('Share item:', itemId)}
        />
        <SubframeCore.DropdownMenu.Root>
          <SubframeCore.DropdownMenu.Trigger asChild={true}>
            <IconButton size="small" icon={<FeatherMoreHorizontal />} onClick={() => {}} />
          </SubframeCore.DropdownMenu.Trigger>
          <SubframeCore.DropdownMenu.Portal>
            <SubframeCore.DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild={true}>
              <DropdownMenu>
                <DropdownMenu.DropdownItem icon={<FeatherCopy />}>
                  Copy
                </DropdownMenu.DropdownItem>
                <DropdownMenu.DropdownItem icon={<FeatherShare2 />}>
                  Share
                </DropdownMenu.DropdownItem>
              </DropdownMenu>
            </SubframeCore.DropdownMenu.Content>
          </SubframeCore.DropdownMenu.Portal>
        </SubframeCore.DropdownMenu.Root>
      </div>
    </div>
  );
}

