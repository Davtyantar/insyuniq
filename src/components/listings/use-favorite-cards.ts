"use client";

import * as React from "react";
import { useApp } from "@/components/providers/app-provider";
import { getCatalogByIds } from "@/lib/api/catalog";
import { createApi, isUuid } from "@/lib/api/client";
import { type CardModel, catalogCard, isCard, legacyCard, orderByIds } from "@/lib/card";
import { getListings } from "@/mock/listings";

/** Favorites are ids in localStorage. UUIDs are API listings, hydrated in chunks of 50; the rest
 * are mock listings of doors not yet on the API. Ids the API omits are forgotten (spec 4.7). */
export function useFavoriteCards(): { cards: CardModel[]; loading: boolean } {
  const { favorites, hydrated, removeFavorites } = useApp();
  const apiIds = React.useMemo(() => favorites.filter(isUuid), [favorites]);
  const [apiCards, setApiCards] = React.useState<CardModel[] | null>(null);

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

  const cards = React.useMemo(() => {
    const mockCards = getListings(favorites.filter((id) => !isUuid(id))).map(legacyCard);
    return orderByIds(favorites, [...(apiCards ?? []), ...mockCards]);
  }, [favorites, apiCards]);

  return { cards, loading: !hydrated || apiCards === null };
}
