"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { stripLocalePrefix } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Auth pages are a focused, single-purpose form — no site chrome around them, on web or mobile. */
const CHROME_FREE_PATHS = new Set(["/sign-in", "/sign-up", "/forgot-password"]);

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showChrome = !CHROME_FREE_PATHS.has(stripLocalePrefix(pathname ?? "/"));

  return (
    <div className={cn("flex min-h-screen flex-1 flex-col", showChrome && "pb-14 md:pb-0")}>
      {showChrome && <Header />}
      {showChrome && <SearchOverlay />}
      <main className="flex-1">{children}</main>
      {showChrome && <Footer />}
      {showChrome && <BottomNav />}
    </div>
  );
}
