"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FeatherSun, FeatherMoon } from "@subframe/core";
import { IconButton } from "@/ui/components/IconButton";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <IconButton icon={<FeatherSun />} disabled />;
  }

  return (
    <IconButton
      icon={resolvedTheme === "dark" ? <FeatherSun /> : <FeatherMoon />}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    />
  );
}
