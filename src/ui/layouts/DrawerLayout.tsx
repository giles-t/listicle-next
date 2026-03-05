"use client";

import React from "react";
import { Drawer } from "../components/Drawer";
import { cn } from "../utils";

interface DrawerLayoutRootProps extends React.ComponentProps<typeof Drawer> {
  children?: React.ReactNode;
  className?: string;
}

const DrawerLayoutRoot = React.forwardRef<
  React.ElementRef<typeof Drawer>,
  DrawerLayoutRootProps
>(function DrawerLayoutRoot({ children, className, ...otherProps }, ref) {
  return (
    <Drawer className={className} ref={ref} {...otherProps}>
      <Drawer.Content>
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-8">
            {children}
          </div>
        ) : null}
      </Drawer.Content>
    </Drawer>
  );
});

export const DrawerLayout = DrawerLayoutRoot;
