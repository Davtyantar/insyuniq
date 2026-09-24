"use client";

import * as React from "react";
import { useApp } from "@/components/providers/app-provider";
import { getCatalogByIds } from "@/lib/api/catalog";
import { createApi, isUuid } from "@/lib/api/client";
import { type CardModel, catalogCard, isCard, legacyCard, orderByIds, partitionFavoriteIds } from "@/lib/card";
import { MOCK_DOORS } from "@/lib/categories";
import { getListings } from "@/mock/listings";

/** Favorites are ids in localStorage. UUIDs are API listings, hydrated in chunks of 50; the rest
 * are mock listings of doors not yet on the API. Ids the API omits, and stale mock ids of doors
 * that have since moved to the API, are forgotten (spec 4.7). */
export function useFavoriteCards(): { cards: CardModel[]; loading: boolean } {
  const { favorites, hydrated, removeFavorites } = useApp();
  // Memoised on the joined string so toggling a mock favorite does not refetch API favorites.
  const apiKey = React.useMemo(() => favorites.filter(isUuid).join(","), [favorites]);
  const apiIds = React.useMemo(() => (apiKey ? apiKey.split(",") : []), [apiKey]);
  const [apiCards, setApiCards] = React.useState<CardModel[] | null>(null);
  const partition = React.useMemo(() => partitionFavoriteIds(favorites, MOCK_DOORS), [favorites]);

  React.useEffect(() => {
    if (!hydrated) return;
    if (apiIds.length === 0) {
      setApiCards([]);
      return;
    }
    let cancelled = false;
    getCatalogByIds(createApi(), apiIds)
      .then((items) => {
        if (cancelled) return;
        setApiCards(items.map(catalogCard).filter(isCard));
        const found = new Set(items.map((item) => item.id));
        const gone = apiIds.filter((id) => !found.has(id));
        if (gone.length > 0) removeFavorites(gone);
      })
      .catch((error: unknown) => {
        // Keep the ids: a network failure must not erase someone's favorites.
        if (!cancelled) {
          console.warn("Could not load favorites", error);
          setApiCards([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [hydrated, apiIds, removeFavorites]);

  // Self-heal storage once hydrated: forget ids that are neither API uuids nor live mock doors.
  const staleKey = partition.staleIds.join(",");
  React.useEffect(() => {
    if (!hydrated || !staleKey) return;
    removeFavorites(staleKey.split(","));
  }, [hydrated, staleKey, removeFavorites]);

  const cards = React.useMemo(() => {
    const mockCards = getListings(partition.mockIds).map(legacyCard);
    return orderByIds(favorites, [...(apiCards ?? []), ...mockCards]);
  }, [favorites, apiCards, partition.mockIds]);

  return { cards, loading: !hydrated || apiCards === null };
}
