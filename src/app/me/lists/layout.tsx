import React from "react";
import TabsHeader from "./TabsHeader";

export default function ListsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container max-w-none flex h-full w-full flex-col items-start gap-8 bg-default-background py-12 overflow-auto">
      <TabsHeader />
      {children}
    </div>
  );
}


