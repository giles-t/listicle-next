"use client";

import React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils";

interface ChevronProps extends React.HTMLAttributes<HTMLSpanElement> { className?: string; }
const Chevron = React.forwardRef<HTMLSpanElement, ChevronProps>(function Chevron({ className, ...otherProps }, ref) {
  return <span className={cn("text-body font-body text-subtext-color transition-transform duration-200 [&>svg]:h-[1em] [&>svg]:w-[1em]", className)} ref={ref} {...otherProps}><ChevronDown /></span>;
});

interface ContentProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const Content = React.forwardRef<HTMLDivElement, ContentProps>(function Content({ children, className, ...otherProps }, ref) {
  return (
    <CollapsiblePrimitive.Content asChild {...otherProps}>
      <div className={cn("flex w-full flex-col items-start", className)} ref={ref}>{children}</div>
    </CollapsiblePrimitive.Content>
  );
});

interface TriggerProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const Trigger = React.forwardRef<HTMLDivElement, TriggerProps>(function Trigger({ children, className, ...otherProps }, ref) {
  return (
    <CollapsiblePrimitive.Trigger asChild {...otherProps}>
      <div className={cn("flex w-full cursor-pointer items-center gap-2", className)} ref={ref}>{children}</div>
    </CollapsiblePrimitive.Trigger>
  );
});

interface AccordionRootProps extends React.HTMLAttributes<HTMLDivElement> {
  trigger?: React.ReactNode; children?: React.ReactNode; open?: boolean; defaultOpen?: boolean; onOpenChange?: (open: boolean) => void; className?: string;
}

const AccordionRoot = React.forwardRef<HTMLDivElement, AccordionRootProps>(
  function AccordionRoot({ trigger, children, open, defaultOpen, onOpenChange, className, ...otherProps }, ref) {
    return (
      <CollapsiblePrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} asChild>
        <div className={cn("flex w-full flex-col items-start gap-2", className)} ref={ref} {...otherProps}>
          {trigger}
          {children}
        </div>
      </CollapsiblePrimitive.Root>
    );
  }
);

export const Accordion = Object.assign(AccordionRoot, { Chevron, Content, Trigger });
