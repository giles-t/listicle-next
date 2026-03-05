"use client";
/*
 * Documentation:
 * Profile Menu Dropdown 2 — https://app.subframe.com/7b590a12c74e/library?component=Profile+Menu+Dropdown+2_3ace6874-8cb8-4435-94db-7ffbf2d31e32
 */

import React from "react";
import { FeatherBell } from "@subframe/core";
import { FeatherStar } from "@subframe/core";
import * as SubframeCore from "@subframe/core";
import * as SubframeUtils from "../utils";

interface ProfileMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const ProfileMenuItem = React.forwardRef<HTMLDivElement, ProfileMenuItemProps>(
  function ProfileMenuItem(
    {
      children,
      icon = <FeatherStar />,
      className,
      ...otherProps
    }: ProfileMenuItemProps,
    ref
  ) {
    return (
      <SubframeCore.DropdownMenu.Item asChild={true}>
        <div
          className={SubframeUtils.twClassNames(
            "group/38bc6220 flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-4 data-[highlighted]:bg-neutral-100 hover:bg-neutral-100 active:bg-neutral-50",
            className
          )}
          ref={ref}
          {...otherProps}
        >
          {icon ? (
            <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
              {icon}
            </SubframeCore.IconWrapper>
          ) : null}
          {children ? (
            <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font">
              {children}
            </span>
          ) : null}
        </div>
      </SubframeCore.DropdownMenu.Item>
    );
  }
);

interface ProfileMenuDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

const ProfileMenuDivider = React.forwardRef<
  HTMLDivElement,
  ProfileMenuDividerProps
>(function ProfileMenuDivider(
  { className, ...otherProps }: ProfileMenuDividerProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-full items-start gap-2 py-2",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex h-px grow shrink-0 basis-0 flex-col items-center gap-2 bg-neutral-200" />
    </div>
  );
});

interface ProfileMenuNotificationItemProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  badgeCount?: React.ReactNode;
  className?: string;
}

const ProfileMenuNotificationItem = React.forwardRef<
  HTMLDivElement,
  ProfileMenuNotificationItemProps
>(function ProfileMenuNotificationItem(
  {
    children,
    icon = <FeatherBell />,
    badgeCount,
    className,
    ...otherProps
  }: ProfileMenuNotificationItemProps,
  ref
) {
  return (
    <SubframeCore.DropdownMenu.Item asChild={true}>
      <div
        className={SubframeUtils.twClassNames(
          "group/868542d0 flex h-10 w-full cursor-pointer items-center gap-3 rounded-md px-4 data-[highlighted]:bg-neutral-100 hover:bg-neutral-100 active:bg-neutral-50",
          className
        )}
        ref={ref}
        {...otherProps}
      >
        {icon ? (
          <SubframeCore.IconWrapper className="text-heading-3 font-heading-3 text-default-font">
            {icon}
          </SubframeCore.IconWrapper>
        ) : null}
        {children ? (
          <span className="line-clamp-1 grow shrink-0 basis-0 text-body font-body text-default-font">
            {children}
          </span>
        ) : null}
        {badgeCount ? (
          <div className="flex h-6 items-center gap-1 rounded-md bg-brand-100 px-2">
            <span className="whitespace-nowrap text-caption font-caption text-brand-800">
              {badgeCount}
            </span>
          </div>
        ) : null}
      </div>
    </SubframeCore.DropdownMenu.Item>
  );
});

interface ProfileMenuDropdown2RootProps
  extends React.HTMLAttributes<HTMLDivElement> {
  image?: string;
  name?: React.ReactNode;
  username?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

const ProfileMenuDropdown2Root = React.forwardRef<
  HTMLDivElement,
  ProfileMenuDropdown2RootProps
>(function ProfileMenuDropdown2Root(
  {
    image,
    name,
    username,
    children,
    className,
    ...otherProps
  }: ProfileMenuDropdown2RootProps,
  ref
) {
  return (
    <div
      className={SubframeUtils.twClassNames(
        "flex w-64 flex-col items-start overflow-hidden rounded-lg border border-solid border-neutral-border bg-default-background shadow-lg",
        className
      )}
      ref={ref}
      {...otherProps}
    >
      <div className="flex w-full items-center gap-3 px-4 py-4">
        <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-full bg-brand-100">
          {image ? (
            <img className="h-12 w-12 flex-none object-cover" src={image} />
          ) : null}
        </div>
        <div className="flex grow shrink-0 basis-0 flex-col items-start">
          {name ? (
            <span className="text-heading-3 font-heading-3 text-default-font">
              {name}
            </span>
          ) : null}
          {username ? (
            <span className="text-caption font-caption text-subtext-color">
              {username}
            </span>
          ) : null}
        </div>
      </div>
      {children ? (
        <div className="flex w-full flex-col items-start">{children}</div>
      ) : null}
    </div>
  );
});

export const ProfileMenuDropdown2 = Object.assign(ProfileMenuDropdown2Root, {
  ProfileMenuItem,
  ProfileMenuDivider,
  ProfileMenuNotificationItem,
});
