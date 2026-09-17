"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useTranslation } from "react-i18next";
import { CATEGORY_LIST } from "@/lib/categories";
import { cn } from "@/lib/utils";

/** Scrolling even this little collapses the bar. */
const HIDE_THRESHOLD_PX = 8;

/**
 * Desktop-only category strip right under the sticky header — the header's own version of this
 * row is hidden on the home page (the tiles below already repeat it), so this one fills that
 * spot instead. Sticks to the same spot as the header initially, then collapses itself away with
 * a short animation as soon as the page scrolls, instead of a plain instant "gone".
 */
export function HomeCategoryNav() {
  const { t } = useTranslation();
  const [hidden, setHidden] = React.useState(false);

  React.useEffect(() => {
    function handleScroll() {
      setHidden(window.scrollY > HIDE_THRESHOLD_PX);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      aria-hidden={hidden}
      className={cn(
        "sticky top-16 z-30 hidden overflow-hidden border-border bg-card transition-[max-height,opacity,transform,border-color] duration-300 ease-out md:block",
        hidden
          ? "pointer-events-none max-h-0 -translate-y-2 border-b-transparent opacity-0"
          : "max-h-11 translate-y-0 border-b opacity-100",
      )}
    >
      <div className="container flex h-11 items-center gap-6 text-sm">
        {CATEGORY_LIST.map((category) => (
          <Link
            key={category.slug}
            href={category.href}
            tabIndex={hidden ? -1 : undefined}
            className="flex items-center gap-2 py-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <category.icon className="h-4 w-4" />
            {category.label}
          </Link>
        ))}
        <Link
          href="/search"
          tabIndex={hidden ? -1 : undefined}
          className="py-2.5 font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {t("common.allListings")}
        </Link>
      </div>
    </div>
  );
}
