"use client";

import * as React from "react";
import type { ChatMessage, Conversation, Listing } from "@/lib/types";
import { CONVERSATIONS } from "@/mock/conversations";

const FAVORITES_KEY = "syuniq:favorites";

interface AppState {
  favorites: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  /** Listings published through the wizard in this session. */
  published: Listing[];
  publishListing: (listing: Listing) => void;
  conversations: Conversation[];
  sendMessage: (conversationId: string, text: string) => void;
  markRead: (conversationId: string) => void;
  unreadTotal: number;
  /** False until localStorage has been read, so SSR and first paint agree. */
  hydrated: boolean;
}

const AppContext = React.createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [published, setPublished] = React.useState<Listing[]>([]);
  const [conversations, setConversations] = React.useState<Conversation[]>(CONVERSATIONS);
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = window.localStorage.getItem(FAVORITES_KEY);
      if (raw) setFavorites(JSON.parse(raw) as string[]);
    } catch {
      // Ignore unavailable or corrupted storage — favorites simply start empty.
    }
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      // Storage can be full or blocked; favourites stay in memory for this session.
    }
  }, [favorites, hydrated]);

  const toggleFavorite = React.useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [id, ...prev]));
  }, []);

  const isFavorite = React.useCallback((id: string) => favorites.includes(id), [favorites]);

  const publishListing = React.useCallback((listing: Listing) => {
    setPublished((prev) => [listing, ...prev]);
  }, []);

  const sendMessage = React.useCallback((conversationId: string, text: string) => {
    const message: ChatMessage = {
      id: `${conversationId}-${Date.now()}`,
      from: "me",
      text,
      sentAt: new Date().toISOString(),
      read: true,
    };
    setConversations((prev) =>
      prev.map((c) => (c.id === conversationId ? { ...c, messages: [...c.messages, message] } : c)),
    );
  }, []);

  const markRead = React.useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, unread: 0, messages: c.messages.map((m) => ({ ...m, read: true })) }
          : c,
      ),
    );
  }, []);

  const unreadTotal = conversations.reduce((sum, c) => sum + c.unread, 0);

  const value = React.useMemo<AppState>(
    () => ({
      favorites,
      isFavorite,
      toggleFavorite,
      published,
      publishListing,
      conversations,
      sendMessage,
      markRead,
      unreadTotal,
      hydrated,
    }),
    [
      favorites,
      isFavorite,
      toggleFavorite,
      published,
      publishListing,
      conversations,
      sendMessage,
      markRead,
      unreadTotal,
      hydrated,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const context = React.useContext(AppContext);
  if (!context) throw new Error("useApp must be used inside <AppProvider>");
  return context;
}
