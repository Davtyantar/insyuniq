import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/categories";

/** Category sections with their subcategory tiles — the main entry point of the home page. */
export function Hero() {
  return (
    <section className="container space-y-8 pt-6 md:pt-8">
      {CATEGORY_LIST.map((category) => (
        <div key={category.slug}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight md:text-2xl">
              <category.icon className="h-5 w-5 text-accent" />
              {category.label}
            </h2>
            <Link
              href={category.href}
              className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700"
            >
              Все объявления
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <nav className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
            {category.subcategories.map((sub) => (
              <Link
                key={sub.value}
                href={`${category.href}?subcategory=${sub.value}`}
                className="flex min-h-[76px] items-start rounded-xl bg-secondary p-3.5 text-[14px] font-medium leading-snug transition-colors hover:bg-brand-50 hover:text-brand-700"
              >
                {sub.label}
              </Link>
            ))}
          </nav>
        </div>
      ))}
    </section>
  );
}
