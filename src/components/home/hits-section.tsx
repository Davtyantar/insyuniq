import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ListingGrid } from "@/components/listings/listing-grid";
import type { Listing } from "@/lib/types";

interface HitsSectionProps {
  title: string;
  subtitle: string;
  href: string;
  listings: Listing[];
}

/** Short "top picks" row for one category on the home page. */
export function HitsSection({ title, subtitle, href, listings }: HitsSectionProps) {
  return (
    <section className="container py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-brand-700"
        >
          Смотреть все
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <ListingGrid listings={listings} columns={4} className="mt-5" />
    </section>
  );
}
