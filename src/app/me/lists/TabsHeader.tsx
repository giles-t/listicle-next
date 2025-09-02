"use client";

import React from "react";
import { Button } from "@/ui/components/Button";
import { Tabs } from "@/ui/components/Tabs";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TabsHeader() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="flex w-full flex-wrap items-center justify-between gap-2">
        <div className="flex flex-col items-start gap-1">
          <span className="text-heading-1 font-heading-1 text-default-font">Your Lists</span>
          <span className="text-heading-3 font-heading-3 text-neutral-400">Manage your drafts and published lists</span>
        </div>
        <Link href="/create">
          <Button>Create new list</Button>
        </Link>
      </div>
      <Tabs>
        <Link href="/me/lists">
          <Tabs.Item active={isActive("/me/lists")}>All</Tabs.Item>
        </Link>
        <Link href="/me/lists/drafts">
          <Tabs.Item active={isActive("/me/lists/drafts")}>Drafts</Tabs.Item>
        </Link>
        <Link href="/me/lists/published">
          <Tabs.Item active={isActive("/me/lists/published")}>Published</Tabs.Item>
        </Link>
      </Tabs>
    </>
  );
}
