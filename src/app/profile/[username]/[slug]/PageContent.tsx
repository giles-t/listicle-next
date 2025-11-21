"use client";

import { PageReactionsProvider } from "./PageReactionsContext";

interface PageContentProps {
  listId: string;
  children: React.ReactNode;
}

export function PageContent({ listId, children }: PageContentProps) {
  return (
    <PageReactionsProvider listId={listId}>
      {children}
    </PageReactionsProvider>
  );
}

