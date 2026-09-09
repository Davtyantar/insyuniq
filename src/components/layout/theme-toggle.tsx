"use client";

import { Moon, Sun } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

/** Light/dark switch — persisted to localStorage and applied instantly, no page reload. */
export function ThemeToggle() {
  const { theme, toggleTheme, hydrated } = useApp();
  const isDark = hydrated && theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={isDark ? "Լուսավոր թեմա" : "Մուգ թեմա"}
      aria-label={isDark ? "Միացնել լուսավոր թեման" : "Միացնել մուգ թեման"}
    >
      <Sun className={isDark ? "hidden h-5 w-5" : "h-5 w-5"} />
      <Moon className={isDark ? "h-5 w-5" : "hidden h-5 w-5"} />
    </Button>
  );
}
