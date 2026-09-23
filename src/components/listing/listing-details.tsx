"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { BadgeCheck, ChevronLeft, ChevronRight, MapPin, Phone } from "lucide-react";
import { ImageGallery } from "@/components/listing/image-gallery";
import { MapPlaceholder } from "@/components/listing/map-placeholder";
import { MobileContactBar } from "@/components/listing/mobile-contact-bar";
import { PriceTag } from "@/components/listing/price-tag";
import { SellerCard } from "@/components/listing/seller-card";
import { ListingCard } from "@/components/listings/listing-card";
import { FavoriteButton } from "@/components/listings/favorite-button";
import type { CardModel } from "@/lib/card";
import { CATEGORIES } from "@/lib/categories";
import type { DetailModel } from "@/lib/detail";
import { formatFullDate, formatRelativeDate } from "@/lib/format";

interface ListingDetailsProps {
  detail: DetailModel;
  similar: CardModel[];
}

/** Gap between cards (Tailwind gap-3 = 0.75rem), used to compute the one-card scroll step. */
const GAP_PX = 12;

export function ListingDetails({ detail, similar }: ListingDetailsProps) {
  const category = CATEGORIES[detail.door];
  const { seller, specs, subcategoryLabel } = detail;
  const place = [detail.location, detail.address].filter(Boolean).join(", ");
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollByCard(direction: 1 | -1) {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const step = (card?.getBoundingClientRect().width ?? el.clientWidth) + GAP_PX;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  }

  return (
    <div className="pb-20 md:pb-0">
      <div className="container py-4 lg:py-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-[13px] text-foreground/70">
          {/* On phones the crumb is capped at two levels — "Home" drops off when a subcategory follows. */}
          <span className={subcategoryLabel ? "hidden sm:contents" : "contents"}>
            <Link href="/" className="transition-colors hover:text-foreground">
              Գլխավոր
            </Link>
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
          <Link href={category.href} className="transition-colors hover:text-foreground">
            {category.label}
          </Link>
          {subcategoryLabel && (
            <>
              <ChevronRight className="h-3.5 w-3.5" />
              <Link
                href={`${category.href}?subcategory=${detail.subcategory}`}
                className="font-medium text-foreground transition-colors hover:text-accent"
              >
                {subcategoryLabel}
              </Link>
            </>
          )}
        </nav>

        <div className="mt-4 grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] lg:gap-10">
          <div className="min-w-0 space-y-8">
            {detail.heroImage ? (
              <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-secondary">
                <Image
                  src={detail.images[0]}
                  alt={detail.title}
                  fill
                  sizes="(max-width: 1280px) 100vw, 760px"
                  priority
                  className="object-cover"
                />
                <FavoriteButton listingId={detail.id} className="absolute right-3 top-3" />
              </div>
            ) : (
              <ImageGallery
                images={detail.images}
                alt={detail.title}
                listingId={detail.id}
                lightboxInfo={
                  <div className="flex min-h-full flex-col">
                    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[12px] font-medium text-secondary-foreground">
                      <category.icon className="h-3.5 w-3.5" />
                      {subcategoryLabel ?? category.label}
                    </span>

                    <div className="mt-4 flex items-center gap-2">
                      {detail.price && (
                        <PriceTag
                          money={detail.price}
                          className="text-[26px] font-semibold leading-none tracking-tight"
                        />
                      )}
                      {detail.verified && (
                        <BadgeCheck className="h-5 w-5 shrink-0 text-accent" aria-label="Ստուգված հայտարարություն" />
                      )}
                    </div>

                    <h2 className="mt-3 break-words text-[16px] font-medium leading-snug">{detail.title}</h2>
                    <p className="mt-1 text-[13px] text-muted-foreground">{detail.headline}</p>

                    <ul className="mt-4 flex flex-wrap gap-1.5">
                      {detail.chips.map((spec) => (
                        <li key={spec} className="rounded-md border border-border bg-background px-2.5 py-1 text-[12px]">
                          {spec}
                        </li>
                      ))}
                    </ul>

                    <p className="mt-4 flex items-start gap-1.5 text-[13px] text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      {place}
                    </p>

                    <div className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground">
                      <span suppressHydrationWarning>{formatRelativeDate(detail.publishedAt)}</span>
                    </div>

                    {detail.description && (
                      <section className="mt-5 border-t border-border pt-5">
                        <h3 className="text-[14px] font-semibold">Նկարագրություն</h3>
                        <p className="mt-2 whitespace-pre-line break-words text-[13.5px] leading-relaxed text-foreground/85">
                          {detail.description}
                        </p>
                      </section>
                    )}

                    {specs.length > 0 && (
                      <section className="mt-5 border-t border-border pt-5">
                        <h3 className="text-[14px] font-semibold">Բնութագրեր</h3>
                        <dl className="mt-1">
                          {specs.map((spec) => (
                            <div
                              key={spec.label}
                              className="flex items-baseline justify-between gap-4 border-b border-border py-2 text-[13px] last:border-b-0"
                            >
                              <dt className="text-muted-foreground">{spec.label}</dt>
                              <dd className="text-right font-medium">{spec.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    )}

                    {seller && (
                      <div className="mt-auto pt-5">
                        <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
                          {seller.avatarUrl && (
                            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
                              <Image src={seller.avatarUrl} alt="" fill sizes="40px" className="object-cover" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-[14px] font-medium">{seller.name}</p>
                            <p className="text-[12px] text-muted-foreground">{seller.typeLabel}</p>
                          </div>
                        </div>
                        <a
                          href={`tel:${seller.phone.replace(/\s+/g, "")}`}
                          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-accent text-[14px] font-semibold text-accent-foreground transition-colors hover:bg-brand-700"
                        >
                          <Phone className="h-4 w-4" />
                          {seller.phone}
                        </a>
                      </div>
                    )}
                  </div>
                }
              />
            )}

            <section>
              <h2 className="text-lg font-semibold tracking-tight">Նկարագրություն</h2>
              <p className="mt-3 whitespace-pre-line break-words text-[15px] leading-relaxed text-foreground/90">
                {detail.description}
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
              <h2 className="text-lg font-semibold tracking-tight">
                {detail.isWorkplace ? "Աշխատավայր" : "Գտնվելու վայրը"}
              </h2>
              <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {place}
              </p>
              {!detail.isWorkplace && detail.coords && (
                <div className="mt-3">
                  <MapPlaceholder address={place} coords={detail.coords} />
                </div>
              )}
            </section>
          </div>

          <aside className="min-w-0 space-y-4 lg:sticky lg:top-[124px] lg:self-start">
            <div className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-2">
                {detail.price && (
                  <PriceTag
                    money={detail.price}
                    className="text-[22px] font-semibold leading-none tracking-tight sm:text-[32px]"
                  />
                )}
                {detail.verified && (
                  <BadgeCheck
                    className="h-6 w-6 shrink-0 text-accent"
                    aria-label="Ստուգված հայտարարություն"
                  >
                    <title>Ստուգված հայտարարություն</title>
                  </BadgeCheck>
                )}
              </div>

              <h1 className="mt-3 break-words text-[14px] font-medium leading-snug sm:text-[19px]">{detail.title}</h1>
              <p className="mt-1 text-[12px] text-muted-foreground sm:text-sm">{detail.headline}</p>

              <ul className="mt-4 flex flex-wrap gap-1.5">
                {detail.chips.map((spec) => (
                  <li
                    key={spec}
                    className="rounded-md border border-border bg-background px-2.5 py-1 text-[13px]"
                  >
                    {spec}
                  </li>
                ))}
              </ul>

              <p className="mt-4 flex items-center gap-1.5 text-[12px] text-muted-foreground sm:text-sm">
                <MapPin className="h-4 w-4 shrink-0" />
                {place}
              </p>

              <div className="mt-4 flex items-center gap-4 border-t border-border pt-4 text-[12px] text-muted-foreground">
                <span title={formatFullDate(detail.publishedAt)} suppressHydrationWarning>
                  {formatRelativeDate(detail.publishedAt)}
                </span>
                <span className="ml-auto">№ {detail.reference}</span>
              </div>

              <FavoriteButton
                listingId={detail.id}
                variant="inline"
                withLabel
                className="mt-4 w-full"
              />
            </div>

            {seller && <SellerCard seller={seller} />}
          </aside>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="container py-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-[16px] font-semibold tracking-tight sm:text-xl">Նմանատիպ հայտարարություններ</h2>
            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-normal">
              <Link
                href={category.href}
                className="text-sm font-medium text-accent transition-colors hover:text-brand-700"
              >
                Բոլորը կատեգորիայում
              </Link>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  aria-label="Նախորդները"
                  onClick={() => scrollByCard(-1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Հաջորդները"
                  onClick={() => scrollByCard(1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors hover:bg-secondary"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div
            ref={scrollerRef}
            className="no-scrollbar snap-x-mandatory mt-5 flex gap-3 overflow-x-auto py-3"
          >
            {similar.map((card, index) => (
              <div
                key={card.id}
                className="w-[calc(50%-6px)] shrink-0 snap-start sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)]"
              >
                <ListingCard card={card} priority={index < 4} />
              </div>
            ))}
          </div>
        </section>
      )}

      {seller && <MobileContactBar phone={seller.phone} />}
    </div>
  );
}
