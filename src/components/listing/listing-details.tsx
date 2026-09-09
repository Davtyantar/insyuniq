import Link from "next/link";
import { BadgeCheck, ChevronRight, Eye, MapPin } from "lucide-react";
import { ImageGallery } from "@/components/listing/image-gallery";
import { MapPlaceholder } from "@/components/listing/map-placeholder";
import { MobileContactBar } from "@/components/listing/mobile-contact-bar";
import { SellerCard } from "@/components/listing/seller-card";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { ListingGrid } from "@/components/listings/listing-grid";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/lib/categories";
import { formatFullDate, formatNumber, formatPrice, formatRelativeDate } from "@/lib/format";
import { cardSpecs, detailSpecs, isDaily, isMonthly, listingSummary, locationLine } from "@/lib/specs";
import type { Listing } from "@/lib/types";
import { getSeller } from "@/mock/sellers";

interface ListingDetailsProps {
  listing: Listing;
  similar: Listing[];
}

export function ListingDetails({ listing, similar }: ListingDetailsProps) {
  const category = CATEGORIES[listing.category];
  const seller = getSeller(listing.sellerId);
  const specs = detailSpecs(listing);
  const subcategoryLabel = category.subcategories.find(
    (s) => s.value === listing.subcategory,
  )?.label;

  return (
    <div className="pb-20 md:pb-0">
      <div className="container py-4 lg:py-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            Գլխավոր
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={category.href} className="transition-colors hover:text-foreground">
            {category.label}
          </Link>
          {subcategoryLabel && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`${category.href}?subcategory=${listing.subcategory}`}
                className="transition-colors hover:text-foreground"
              >
                {subcategoryLabel}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10">
          <div className="min-w-0 space-y-8">
            <ImageGallery images={listing.images} alt={listing.title} listingId={listing.id} />

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Նկարագրություն</h2>
              <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground/90">
                {listing.description}
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Բնութագրեր</h2>
              <dl className="mt-3 grid gap-x-10 sm:grid-cols-2">
                {specs.map((spec) => (
                  <div
                    key={spec.label}
                    className="flex items-baseline justify-between gap-4 border-b border-border py-2.5 text-[14px]"
                  >
                    <dt className="text-muted-foreground">{spec.label}</dt>
                    <dd className="text-right font-medium">{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Գտնվելու վայրը</h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {locationLine(listing)}, {listing.address}
              </p>
              <div className="mt-3">
                <MapPlaceholder address={`${locationLine(listing)}, ${listing.address}`} coords={listing.coords} />
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-[124px] lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                {listing.verified && (
                  <Badge variant="accent" className="gap-1">
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Ստուգված հայտարարություն
                  </Badge>
                )}
                <Badge variant="default">{subcategoryLabel}</Badge>
              </div>

              <p className="mt-3 text-[32px] font-semibold leading-none tracking-tight">
                {formatPrice(listing.price, { perMonth: isMonthly(listing), perDay: isDaily(listing) })}
              </p>

              <h1 className="mt-3 text-[19px] font-medium leading-snug">{listing.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">{listingSummary(listing)}</p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {cardSpecs(listing).map((spec) => (
                  <li
                    key={spec}
                    className="rounded-md border border-border bg-background px-2.5 py-1 text-[13px]"
                  >
                    {spec}
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0" />
                {locationLine(listing)}, {listing.address}
              </p>

              <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-[12px] text-muted-foreground">
                <span title={formatFullDate(listing.publishedAt)}>
                  {formatRelativeDate(listing.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  {formatNumber(listing.views)} դիտում
                </span>
                <span className="ml-auto">№ {listing.id.toUpperCase()}</span>
              </div>

              <FavoriteButton
                listingId={listing.id}
                variant="inline"
                withLabel
                className="mt-4 w-full"
              />
            </div>

            <SellerCard seller={seller} />
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="container py-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold tracking-tight">Նմանատիպ հայտարարություններ</h2>
            <Link
              href={category.href}
              className="text-sm font-medium text-accent transition-colors hover:text-brand-700"
            >
              Բոլորը կատեգորիայում
            </Link>
          </div>
          <ListingGrid listings={similar} columns={4} className="mt-5" />
        </section>
      )}

      <MobileContactBar phone={seller.phone} />
    </div>
  );
}
