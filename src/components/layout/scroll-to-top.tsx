"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/lib/i18n";

/**
 * Starts every newly opened page at the very top.
 *
 * The App Router only scrolls on navigation when the new page's first element is *outside* the
 * viewport. Coming from a page scrolled down by less than a screen, that element already counts
 * as "in view", so nothing scrolls — and with our sticky header covering the top ~110px, the new
 * page opens with its title hidden underneath it. Resetting to 0 on each pathname change fixes
 * that. Back/forward navigations are left alone so the browser's scroll restoration still works,
 * and query-only changes (filters, profile tabs) and language switches (only the locale prefix
 * changes) keep their position since the underlying page is the same.
 */
export function ScrollToTop() {
  // Locale prefix stripped, so switching language ("/cars" -> "/ru/cars") isn't a new page.
  const page = stripLocalePrefix(usePathname() ?? "/");
  const isHistoryNavigation = React.useRef(false);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    const markHistoryNavigation = () => {
      isHistoryNavigation.current = true;
    };
    window.addEventListener("popstate", markHistoryNavigation);
    return () => window.removeEventListener("popstate", markHistoryNavigation);
  }, []);

  // Layout effect: runs after the router's own scroll handling but before paint, so the page
  // never flashes at the wrong offset.
  React.useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (isHistoryNavigation.current) {
      isHistoryNavigation.current = false;
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [page]);

  return null;
}
