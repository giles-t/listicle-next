"use client";

import React, { useCallback } from "react";
import { Clipboard } from "lucide-react";
import { cn } from "../utils";
import { Tooltip } from "./Tooltip";

interface CopyToClipboardButtonRootProps extends React.HTMLAttributes<HTMLDivElement> {
  clipboardText?: React.ReactNode; tooltipText?: React.ReactNode; icon?: React.ReactNode; onCopy?: () => void; className?: string;
}

const CopyToClipboardButtonRoot = React.forwardRef<HTMLDivElement, CopyToClipboardButtonRootProps>(
  function CopyToClipboardButtonRoot({ clipboardText, tooltipText, icon = <Clipboard />, onCopy, className, ...otherProps }, ref) {
    const handleClick = useCallback(() => {
      if (clipboardText) {
        navigator.clipboard.writeText(clipboardText as string).then(() => { onCopy?.(); });
      }
    }, [clipboardText, onCopy]);

    return (
      <div
        className={cn("group flex h-6 w-6 cursor-pointer flex-col items-center justify-center gap-2 rounded-md hover:bg-neutral-100", className)}
        ref={ref}
        onClick={handleClick}
        title={tooltipText as string}
        {...otherProps}
      >
        {icon ? <span className="text-body font-body text-subtext-color group-hover:text-default-font shrink-0 [&>svg]:h-[1em] [&>svg]:w-[1em]">{icon}</span> : null}
      </div>
    );
  }
);

export const CopyToClipboardButton = CopyToClipboardButtonRoot;
