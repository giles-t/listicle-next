"use client";
/*
 * Documentation:
 * Topbar with search — https://app.subframe.com/7b590a12c74e/library?component=Topbar+with+search_27f64edc-a451-416b-98b4-9bb1f95991e0
 * Text Field — https://app.subframe.com/7b590a12c74e/library?component=Text+Field_be48ca43-f8e7-4c0e-8870-d219ea11abfe
 * Button — https://app.subframe.com/7b590a12c74e/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 * Icon Button — https://app.subframe.com/7b590a12c74e/library?component=Icon+Button_af9405b1-8c54-4e01-9786-5aad308224f6
 * Avatar — https://app.subframe.com/7b590a12c74e/library?component=Avatar_bec25ae6-5010-4485-b46b-cf79e3943ab2
 */

import React from "react";
import * as SubframeUtils from "../utils";

interface NavItemProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  className?: string;
}

const NavItem = React.forwardRef<HTMLDivElement, NavItemProps>(function NavItem(
  { selected = false, className, ...otherProps }: NavItemProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "group/b6b25fe9 flex cursor-pointer items-start gap-4 rounded-md px-2 py-1",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <span
        className={SubframeUtils.twClassNames(
          "text-body-bold font-body-bold text-subtext-color group-hover/b6b25fe9:text-default-font",
          { "text-default-font": selected }
        )}
      >
        Label
      </span>
    </div>
  );
});

interface TopbarWithSearchRootProps extends React.HTMLAttributes<HTMLElement> {
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  className?: string;
}

const TopbarWithSearchRoot = React.forwardRef<
  HTMLElement,
  TopbarWithSearchRootProps
>(function TopbarWithSearchRoot(
  { leftSlot, rightSlot, className, ...otherProps }: TopbarWithSearchRootProps,
  ref
) {
  return (
    <nav
      className={SubframeUtils.twClassNames(
        "flex w-full items-center gap-4 bg-default-background px-6 py-4",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      {leftSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center gap-6">
          {leftSlot}
        </div>
      ) : null}
      {rightSlot ? (
        <div className="flex grow shrink-0 basis-0 items-center justify-end gap-4">
          {rightSlot}
        </div>
      ) : null}
    </nav>
  );
});

export const TopbarWithSearch = Object.assign(TopbarWithSearchRoot, {
  NavItem,
});
