"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand } from "lucide-react";
import { FavoriteButton } from "@/components/listings/favorite-button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageGalleryProps {
  images: string[];
  alt: string;
  listingId: string;
}

export function ImageGallery({ images, alt, listingId }: ImageGalleryProps) {
  const [index, setIndex] = React.useState(0);
  const [fullscreen, setFullscreen] = React.useState(false);
  const trackRef = React.useRef<HTMLDivElement>(null);

  const go = React.useCallback(
    (next: number) => setIndex((next + images.length) % images.length),
    [images.length],
  );

  React.useEffect(() => {
    if (!fullscreen) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [fullscreen, go, index]);

  /** Keeps the mobile swipe track and the dot indicator in sync. */
  function onTrackScroll() {
    const track = trackRef.current;
    if (!track) return;
    const next = Math.round(track.scrollLeft / track.clientWidth);
    if (next !== index) setIndex(next);
  }

  return (
    <div className="space-y-3">
      {/* Mobile: horizontal swipe carousel */}
      <div className="relative md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="flex snap-x-mandatory snap-mandatory overflow-x-auto no-scrollbar"
        >
          {images.map((src, i) => (
            <div key={src + i} className="relative aspect-[4/3] w-full shrink-0 snap-center">
              <Image
                src={src}
                alt={`${alt} — фото ${i + 1}`}
                fill
                sizes="100vw"
                priority={i === 0}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        <FavoriteButton listingId={listingId} className="absolute right-3 top-3" />
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((src, i) => (
            <span
              key={src + i}
              className={cn(
                "h-1.5 rounded-full bg-white/60 transition-all",
                i === index ? "w-5 bg-white" : "w-1.5",
              )}
            />
          ))}
        </div>
        <span className="absolute bottom-3 right-3 rounded-md bg-slate-950/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          {index + 1} / {images.length}
        </span>
      </div>

      {/* Desktop: main image + thumbnails */}
      <div className="hidden md:block">
        <div className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary">
          <Image
            src={images[index]}
            alt={`${alt} — фото ${index + 1}`}
            fill
            sizes="(max-width: 1280px) 60vw, 760px"
            priority
            className="object-cover"
          />

          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Предыдущее фото"
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 opacity-0 shadow-card backdrop-blur transition-opacity hover:bg-card group-hover:opacity-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Следующее фото"
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-card/90 opacity-0 shadow-card backdrop-blur transition-opacity hover:bg-card group-hover:opacity-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => setFullscreen(true)}
            className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-md bg-slate-950/65 px-2.5 py-1.5 text-[12px] font-medium text-white backdrop-blur transition-colors hover:bg-slate-950/80"
          >
            <Expand className="h-3.5 w-3.5" />
            На весь экран
          </button>

          <FavoriteButton listingId={listingId} className="absolute right-3 top-3" />

          <span className="absolute bottom-3 left-3 rounded-md bg-slate-950/65 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
            {index + 1} / {images.length}
          </span>
        </div>

        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 thin-scrollbar">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Фото ${i + 1}`}
              className={cn(
                "relative h-[72px] w-[104px] shrink-0 overflow-hidden rounded-md border-2 transition-colors",
                i === index ? "border-accent" : "border-transparent hover:border-border",
              )}
            >
              <Image src={src} alt="" fill sizes="104px" className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent variant="full" className="flex items-center justify-center">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <div className="relative h-full w-full">
            <Image
              src={images[index]}
              alt={`${alt} — фото ${index + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>
          <button
            type="button"
            onClick={() => go(index - 1)}
            aria-label="Предыдущее фото"
            className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={() => go(index + 1)}
            aria-label="Следующее фото"
            className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-md bg-white/10 px-3 py-1 text-sm text-white backdrop-blur">
            {index + 1} / {images.length}
          </span>
        </DialogContent>
      </Dialog>
    </div>
  );
}
