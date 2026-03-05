"use client";

import React from "react";
import { cn } from "../utils";

// Calendar is a placeholder - the original used SubframeCore.Calendar
// If needed, integrate with a date picker library like react-day-picker
interface CalendarRootProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const CalendarRoot = React.forwardRef<HTMLDivElement, CalendarRootProps>(
  function CalendarRoot({ className, ...otherProps }, ref) {
    return <div className={cn("w-full rounded-md border border-neutral-border p-4", className)} ref={ref} {...otherProps} />;
  }
);

export const Calendar = CalendarRoot;
