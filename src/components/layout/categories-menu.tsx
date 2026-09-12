"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { ChevronRight, Menu } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp } from "@/components/providers/app-provider";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CATEGORY_LIST } from "@/lib/categories";
import { cn } from "@/lib/utils";

/** Burger menu next to the logo: hover a category on the left, jump straight to a subcategory on the right. */
export function CategoriesMenu() {
  const { t } = useTranslation();
  const { categoriesMenuOpen: open, setCategoriesMenuOpen: setOpen } = useApp();
  const [active, setActive] = React.useState(CATEGORY_LIST[0].slug);

  // Radix's default "modal" behavior locks page scroll while open — this menu should stay
  // over a normally-scrollable page, closing itself the moment the user scrolls instead.
  React.useEffect(() => {
    if (!open) return;
    setActive(CATEGORY_LIST[0].slug);
    function close() {
      setOpen(false);
    }
    window.addEventListener("scroll", close, { passive: true, capture: true });
    return () => window.removeEventListener("scroll", close, { capture: true });
  }, [open, setOpen]);

  const activeCategory = CATEGORY_LIST.find((category) => category.slug === active) ?? CATEGORY_LIST[0];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="hidden shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary sm:flex"
          title={t("common.allSections")}
        >
          <Menu className="h-[18px] w-[18px]" />
          <span className="hidden lg:inline">{t("common.sections")}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="flex w-[660px] max-w-[92vw] gap-0 p-0">
        <div className="flex w-[240px] shrink-0 flex-col gap-1 border-r border-border p-2.5">
          {CATEGORY_LIST.map((category) => (
            <Link
              key={category.slug}
              href={category.href}
              onMouseEnter={() => setActive(category.slug)}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active === category.slug
                  ? "bg-secondary font-medium text-foreground"
                  : "text-foreground hover:bg-secondary/70",
              )}
            >
              <category.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 truncate">{category.label}</span>
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4">
          <Link
            href={activeCategory.href}
            onClick={() => setOpen(false)}
            className="mb-3 block px-1 text-sm font-semibold text-foreground transition-colors hover:text-accent"
          >
            {activeCategory.label}
          </Link>
          <div className="flex flex-col gap-0.5">
            {activeCategory.subcategories.map((sub) => (
              <Link
                key={sub.value}
                href={`${activeCategory.href}?subcategory=${sub.value}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
              >
                {sub.icon && <sub.icon className="h-4 w-4 shrink-0" />}
                <span>{sub.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
