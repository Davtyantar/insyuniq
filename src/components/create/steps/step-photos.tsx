"use client";

import * as React from "react";
import { ImagePlus, Star, Trash2, UploadCloud } from "lucide-react";
import { StepHeader } from "@/components/create/field";
import { Button } from "@/components/ui/button";
import type { DraftPhoto, ListingDraft } from "@/lib/draft";
import { cn } from "@/lib/utils";

interface StepProps {
  draft: ListingDraft;
  patch: (patch: Partial<ListingDraft>) => void;
}

const MAX_PHOTOS = 12;

export function StepPhotos({ draft, patch }: StepProps) {
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const addFiles = React.useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      const accepted = Array.from(files)
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, MAX_PHOTOS - draft.photos.length)
        .map<DraftPhoto>((file) => ({
          id: `${file.name}-${file.size}-${Math.random().toString(36).slice(2, 8)}`,
          url: URL.createObjectURL(file),
          name: file.name,
        }));
      if (accepted.length) patch({ photos: [...draft.photos, ...accepted] });
    },
    [draft.photos, patch],
  );

  function remove(id: string) {
    const photo = draft.photos.find((p) => p.id === id);
    if (photo) URL.revokeObjectURL(photo.url);
    patch({ photos: draft.photos.filter((p) => p.id !== id) });
  }

  function makeCover(id: string) {
    const photo = draft.photos.find((p) => p.id === id);
    if (!photo) return;
    patch({ photos: [photo, ...draft.photos.filter((p) => p.id !== id)] });
  }

  return (
    <div>
      <StepHeader
        title="Фотографии"
        description="Первое фото станет обложкой. Объявления с 5+ фото получают втрое больше откликов."
      />

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors",
          dragging ? "border-accent bg-brand-50/70" : "border-border bg-card",
        )}
      >
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <UploadCloud className="h-6 w-6" />
        </span>
        <p className="text-[15px] font-medium">Перетащите фотографии сюда</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          JPG или PNG, до {MAX_PHOTOS} фотографий
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-4 gap-2"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="h-4 w-4" />
          Выбрать файлы
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {draft.photos.length > 0 && (
        <>
          <p className="mt-5 text-[13px] text-muted-foreground">
            {draft.photos.length} из {MAX_PHOTOS} загружено
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {draft.photos.map((photo, index) => (
              <li
                key={photo.id}
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-secondary"
              >
                {/* Object URLs cannot be optimised by next/image, so a plain img is correct here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo.url} alt={photo.name} className="h-full w-full object-cover" />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-md bg-slate-950/70 px-2 py-0.5 text-[11px] font-medium text-white">
                    Обложка
                  </span>
                )}
                <div className="absolute inset-x-2 bottom-2 flex justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  {index !== 0 && (
                    <button
                      type="button"
                      onClick={() => makeCover(photo.id)}
                      aria-label="Сделать обложкой"
                      className="flex h-8 w-8 items-center justify-center rounded-md bg-card/90 backdrop-blur transition-colors hover:bg-card"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(photo.id)}
                    aria-label="Удалить фото"
                    className="flex h-8 w-8 items-center justify-center rounded-md bg-card/90 text-destructive backdrop-blur transition-colors hover:bg-card"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {draft.photos.length === 0 && (
        <p className="mt-4 text-[13px] text-muted-foreground">
          Можно продолжить без фотографий — мы подставим временную обложку, но объявление будет
          показываться реже.
        </p>
      )}
    </div>
  );
}
