import React from "react";
import { cn } from "../utils";
import { TopNav } from "../../client/components/TopNav";

interface DefaultPageLayoutRootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const DefaultPageLayoutRoot = React.forwardRef<HTMLDivElement, DefaultPageLayoutRootProps>(
  function DefaultPageLayoutRoot({ children, className, ...otherProps }, ref) {
    return (
      <div
        className={cn("flex h-screen w-full flex-col items-center", className)}
        ref={ref}
        {...otherProps}
      >
        <TopNav />
        {children ? (
          <div className="flex w-full grow shrink-0 basis-0 flex-col items-start gap-4 bg-default-background">
            {children}
          </div>
        ) : null}
      </div>
    );
  }
);

export const DefaultPageLayout = DefaultPageLayoutRoot;
