"use client";
/*
 * Documentation:
 * Topbar — https://app.subframe.com/7b590a12c74e/library?component=Topbar_220cd895-c058-4dcc-bc4d-33ed194639d8
 * Icon Button — https://app.subframe.com/7b590a12c74e/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Button — https://app.subframe.com/7b590a12c74e/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeUtils from "../utils";
import * as SubframeCore from "@subframe/core";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  {
    selected = false,
    icon = null,
    children,
    className,
    ...otherProps
  }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/0c2b75b5 flex cursor-pointer items-center justify-center gap-2 rounded-md px-2 py-1",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {icon ? (
        <SubframeCore.IconWrapper
          className={SubframeUtils.twClassNames(
            "text-body font-body text-subtext-color group-hover/0c2b75b5:text-default-font",
            { "text-default-font": selected }
          )}
        >
          {icon}
        </SubframeCore.IconWrapper>
      ) : null}
      {children ? (
        <span
          className={SubframeUtils.twClassNames(
            "text-body font-body text-subtext-color group-hover/0c2b75b5:text-default-font",
            { "text-body-bold font-body-bold text-default-font": selected }
          )}
        >
          {children}
        </span>
      ) : null}
    </div>
  );
});

interface TopbarRootProps extends React.HTMLAttributes<HTMLElement> {
  leftSlot?: React.ReactNode;
  centerSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

const TopbarRoot = React.forwardRef<HTMLElement, TopbarRootProps>(
  function TopbarRoot(
    {
      leftSlot,
      centerSlot,
      rightSlot,
      className,
      ...otherProps
    }: TopbarRootProps,
    ref
  ) {
    return (
      <nav
        className={SubframeUtils.twClassNames(
          "flex w-full items-center gap-4 border-b border-solid border-neutral-border bg-default-background px-4 py-4",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {leftSlot ? (
          <div className="flex grow shrink-0 basis-0 items-center gap-2">
            {leftSlot}
          </div>
        ) : null}
        {centerSlot ? (
          <div className="flex grow shrink-0 basis-0 items-center justify-center gap-1">
            {centerSlot}
          </div>
        ) : null}
        {rightSlot ? (
          <div className="flex grow shrink-0 basis-0 items-center justify-end gap-2">
            {rightSlot}
          </div>
        ) : null}
      </nav>
    );
  }
);

export const Topbar = Object.assign(TopbarRoot, {
  NavItem,
});
