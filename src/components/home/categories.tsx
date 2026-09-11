import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CATEGORY_LIST } from "@/lib/categories";

/** The four category groups — no city name in the headings, the city already lives in the header. */
export function Categories() {
  return (
    <section className='container space-y-5 pt-6 md:pt-8'>
      <h2 className='text-xl font-bold tracking-tight text-foreground md:text-2xl'>
        Կատեգորիաներ
      </h2>

      <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
        {CATEGORY_LIST.filter((category) => category.slug !== "work").map((category) => {
          return (
            <div
              key={category.slug}
              className='rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-6'
            >
              <div className='flex items-center justify-between gap-3'>
                <h3 className='text-[18px] font-bold text-foreground'>
                  {category.label}
                </h3>
                <Link
                  href={category.href}
                  className='inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700'
                >
                  Բոլոր հայտարարությունները
                  <ArrowRight className='h-4 w-4' />
                </Link>
              </div>

              <nav className='mt-4 flex flex-wrap gap-2'>
                {category.subcategories.map((sub) => (
                  <Link
                    key={sub.value}
                    href={`${category.href}?subcategory=${sub.value}`}
                    className='group flex items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-[13px] font-medium leading-snug text-secondary-foreground/80 ring-1 ring-transparent transition-all hover:bg-accent/10 hover:text-accent hover:ring-accent/25 hover:shadow-sm'
                  >
                    {sub.icon && (
                      <sub.icon className='h-4 w-4 shrink-0 text-accent transition-transform group-hover:scale-110' />
                    )}
                    <span>{sub.label}</span>
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
