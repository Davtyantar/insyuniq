"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface ImageLightboxProps {
  images: string[];
  alt: string;
  index: number;
  onIndexChange: (index: number) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Full-screen image viewer over a blurred backdrop instead of a solid panel —
 * a generic, reusable "click an image, see it big" modal for any gallery in the app.
 */
export function ImageLightbox({
  images,
  alt,
  index,
  onIndexChange,
  open,
  onOpenChange,
}: ImageLightboxProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent variant="blur">
        <DialogTitle className="sr-only">{alt}</DialogTitle>

        <div className="relative h-[80vh] w-[92vw] max-w-5xl">
          <Image
            src={images[index]}
            alt={`${alt} — նկար ${index + 1}`}
            fill
            sizes="92vw"
            className="object-contain"
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Նախորդ նկարը"
              className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-md backdrop-blur transition-colors hover:bg-card sm:left-6"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              aria-label="Հաջորդ նկարը"
              className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-card/80 text-foreground shadow-md backdrop-blur transition-colors hover:bg-card sm:right-6"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-card/80 px-3 py-1 text-sm font-medium text-foreground shadow-md backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
