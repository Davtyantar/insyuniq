"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";

/** Light/dark switch — persisted to localStorage and applied instantly, no page reload. */
export function ThemeToggle() {
  const { t } = useTranslation();
  const { theme, toggleTheme, hydrated } = useApp();
  const isDark = hydrated && theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      title={isDark ? t("common.lightTheme") : t("common.darkTheme")}
      aria-label={isDark ? t("common.switchToLightTheme") : t("common.switchToDarkTheme")}
    >
      <Sun className={isDark ? "hidden h-5 w-5" : "h-5 w-5"} />
      <Moon className={isDark ? "h-5 w-5" : "hidden h-5 w-5"} />
    </Button>
  );
}
