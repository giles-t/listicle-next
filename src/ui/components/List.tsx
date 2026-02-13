"use client";
/*
 * Documentation:
 * List — https://app.subframe.com/7b590a12c74e/library?component=List_414641ff-6f21-4e4e-81b4-170160998f40
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface ListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  leftSlot?: React.ReactNode;
  children?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

const ListItem = React.forwardRef<HTMLDivElement, ListItemProps>(
  function ListItem(
    { leftSlot, children, rightSlot, className, ...otherProps }: ListItemProps,
    ref
  ) {
    return (
      <div
        className={SubframeUtils.twClassNames(
          "group/b47949b5 flex w-full cursor-pointer items-center gap-4 rounded-md px-4 py-4 hover:bg-neutral-100 active:bg-neutral-50",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {leftSlot ? (
          <div className="flex items-start gap-2">{leftSlot}</div>
        ) : null}
        {children ? (
          <div className="flex grow shrink-0 basis-0 flex-col items-start">
            {children}
          </div>
        ) : null}
        {rightSlot ? (
          <div className="flex items-center justify-end gap-4">{rightSlot}</div>
        ) : null}
      </div>
    );
  }
);

interface ListRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const ListRoot = React.forwardRef<HTMLDivElement, ListRootProps>(
  function ListRoot(
    { children, className, ...otherProps }: ListRootProps,
    ref
  ) {
    return children ? (
      <div
        className={SubframeUtils.twClassNames(
          "flex h-full w-full flex-col items-start",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {children}
      </div>
    ) : null;
  }
);

export const List = Object.assign(ListRoot, {
  ListItem,
});
