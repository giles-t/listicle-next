"use client";

import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../utils";

interface ItemProps extends React.HTMLAttributes<HTMLSpanElement> { children?: React.ReactNode; className?: string; }
const Item = React.forwardRef<HTMLSpanElement, ItemProps>(
  function Item({ children, className, ...otherProps }, ref) {
    return <span className={cn("text-body font-body text-subtext-color cursor-pointer hover:text-default-font", className)} ref={ref} {...otherProps}>{children}</span>;
  }
);

const Divider = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function Divider({ className, ...otherProps }, ref) {
    return <ChevronRight className={cn("h-4 w-4 text-subtext-color", className)} ref={ref} {...otherProps} />;
  }
);

interface BreadcrumbsRootProps extends React.HTMLAttributes<HTMLDivElement> { children?: React.ReactNode; className?: string; }
const BreadcrumbsRoot = React.forwardRef<HTMLDivElement, BreadcrumbsRootProps>(
  function BreadcrumbsRoot({ children, className, ...otherProps }, ref) {
    return <div className={cn("flex items-center gap-1", className)} ref={ref} {...otherProps}>{children}</div>;
  }
);

export const Breadcrumbs = Object.assign(BreadcrumbsRoot, { Item, Divider });
