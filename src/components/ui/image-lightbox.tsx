"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ImageLightboxProps {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional side column (e.g. price, title, specs) shown to the right of the photo on `lg` and up. */
  info?: React.ReactNode;
}

/**
 * Full-screen, edge-to-edge image viewer — a generic "click an image, see it big" view for any
 * gallery in the app. Not a floating card: the photo gets the whole stage, with the arrows
 * beside it and a thumbnail strip underneath. When `info` is passed, large screens get it as a
 * full-height column on the right. Every part is sized off the
 * viewport, so nothing gets cut off on short laptop screens. Every photo stays mounted and they
 * crossfade, so switching never flashes an empty frame. Colours follow the site theme.
 */
export function ImageLightbox({
  images,
  alt,
  index,
  onIndexChange,
  open,
  onOpenChange,
  info,
}: ImageLightboxProps) {
  const thumbsRef = React.useRef<HTMLDivElement>(null);

  const go = React.useCallback(
    (next: number) => onIndexChange((next + images.length) % images.length),
    [images.length, onIndexChange],
  );

  React.useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, index]);

  // Keep the active thumbnail in view as the arrows / keyboard move through a long strip.
  React.useEffect(() => {
    if (!open) return;
    const thumb = thumbsRef.current?.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [open, index]);

  const multiple = images.length > 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="full" hideClose className="flex data-[state=open]:animate-fade-in">
        <DialogTitle className="sr-only">{alt}</DialogTitle>

        <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-secondary text-foreground">
          <div className="relative flex shrink-0 items-center justify-between px-4 py-3 sm:px-6">
            <span className="rounded-full border border-border bg-card px-3 py-1 text-[13px] font-medium tabular-nums shadow-sm">
              {index + 1} / {images.length}
            </span>
            <DialogClose className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card shadow-sm transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <X className="h-5 w-5" />
              <span className="sr-only">Փակել</span>
            </DialogClose>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center gap-2 px-2 sm:gap-4 sm:px-4">
            {multiple && (
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Նախորդ նկարը"
                className="absolute left-3 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:scale-105 hover:bg-background sm:static"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            {/* Each photo sizes itself to its own proportions (not `fill`), so the rounded
                corners and border sit on the photo's real edges instead of an invisible box. */}
            <div className="relative h-full min-w-0 flex-1">
              {images.map((src, i) => (
                <div
                  key={src + i}
                  aria-hidden={i !== index || undefined}
                  className={cn(
                    "absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-out",
                    i === index ? "opacity-100" : "pointer-events-none opacity-0",
                  )}
                >
                  <Image
                    src={src}
                    alt={i === index ? `${alt} — նկար ${index + 1}` : ""}
                    width={1600}
                    height={1200}
                    sizes="(max-width: 1024px) 100vw, 75vw"
                    loading="eager"
                    className="h-auto max-h-full w-auto max-w-full rounded-2xl border border-border object-contain shadow-xl"
                  />
                </div>
              ))}
            </div>

            {multiple && (
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Հաջորդ նկարը"
                className="absolute right-3 z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-lg transition hover:scale-105 hover:bg-background sm:static"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}
          </div>

          {multiple && (
            <div
              ref={thumbsRef}
              className="no-scrollbar relative flex shrink-0 justify-start gap-2 overflow-x-auto px-4 py-3 sm:justify-center sm:px-6 sm:py-4"
            >
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`Նկար ${i + 1}`}
                  aria-current={i === index || undefined}
                  className={cn(
                    "relative h-12 w-[4.5rem] shrink-0 overflow-hidden rounded-lg transition sm:h-14 sm:w-20",
                    i === index
                      ? "ring-2 ring-accent ring-offset-2 ring-offset-secondary"
                      : "opacity-50 hover:opacity-100",
                  )}
                >
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {info && (
          <aside className="thin-scrollbar hidden w-[360px] shrink-0 overflow-y-auto border-l border-border bg-card p-6 text-foreground lg:block">
            {info}
          </aside>
        )}
      </DialogContent>
    </Dialog>
  );
}
