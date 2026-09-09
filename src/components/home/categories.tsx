import Link from "next/link";
import { ArrowRight, Car, Home, Hotel, Key, type LucideIcon } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/categories";
import type { CategorySlug } from "@/lib/types";

/** One icon per group heading — independent of the icon each category uses elsewhere (header nav, etc). */
const GROUP_ICONS: Record<CategorySlug, LucideIcon> = {
  "real-estate": Home,
  cars: Car,
  rentals: Key,
  hotels: Hotel,
};

/** The four category groups — no city name in the headings, the city already lives in the header. */
export function Categories() {
  return (
    <section className="container space-y-5 pt-6 md:pt-8">
      <h2 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
        Популярные категории
      </h2>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {CATEGORY_LIST.map((category) => {
          const GroupIcon = GROUP_ICONS[category.slug];
          return (
            <div
              key={category.slug}
              className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="flex items-center gap-2 text-[18px] font-bold text-slate-900">
                  <GroupIcon className="h-5 w-5 text-accent" />
                  {category.label}
                </h3>
                <Link
                  href={category.href}
                  className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700"
                >
                  Все объявления
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.value}
                    href={`${category.href}?subcategory=${sub.value}`}
                    className="flex items-center gap-2 rounded-xl bg-[#F5F5F7] px-3 py-2.5 text-[13px] font-medium leading-snug text-slate-700 transition-colors hover:bg-slate-200"
                  >
                    {sub.icon && <sub.icon className="h-4 w-4 shrink-0 text-accent" />}
                    <span className="truncate">{sub.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          );
        })}
      </div>
    </section>
  );
}
