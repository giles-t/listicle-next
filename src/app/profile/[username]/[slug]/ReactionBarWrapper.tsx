"use client";

import { ReactionBar } from "./ReactionBar";
import { createClient } from "@/src/client/supabase";
import { useEffect, useState } from "react";

interface ReactionBarWrapperProps {
  listId: string;
}

export function ReactionBarWrapper({ listId }: ReactionBarWrapperProps) {
  const [userId, setUserId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id);
    };
    getUser();
  }, []);

  return <ReactionBar listId={listId} targetId={null} userId={userId} />;
}

