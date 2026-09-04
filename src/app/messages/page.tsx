"use client";

import * as React from "react";
import { MessagesSquare, Search } from "lucide-react";
import { ChatList } from "@/components/chat/chat-list";
import { ChatWindow } from "@/components/chat/chat-window";
import { EmptyState } from "@/components/listings/empty-state";
import { useApp } from "@/components/providers/app-provider";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getListing } from "@/mock/listings";
import { getSeller } from "@/mock/sellers";

export default function MessagesPage() {
  const { conversations, sendMessage, markRead } = useApp();
  const [activeId, setActiveId] = React.useState<string | null>(conversations[0]?.id ?? null);
  const [query, setQuery] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return conversations;
    return conversations.filter((conversation) => {
      const seller = getSeller(conversation.sellerId);
      const listing = getListing(conversation.listingId);
      return (
        seller.name.toLowerCase().includes(term) ||
        (listing?.title.toLowerCase().includes(term) ?? false) ||
        conversation.messages.some((m) => m.text.toLowerCase().includes(term))
      );
    });
  }, [conversations, query]);

  const active = conversations.find((c) => c.id === activeId) ?? null;

  function select(id: string) {
    setActiveId(id);
    markRead(id);
  }

  return (
    <div className="container py-4 lg:py-6">
      <h1 className="mb-4 text-2xl font-semibold tracking-tight lg:text-[28px]">Сообщения</h1>

      <div className="grid h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-lg border border-border bg-card lg:grid-cols-[340px_minmax(0,1fr)]">
        <div
          className={cn(
            "flex min-h-0 flex-col border-border lg:border-r",
            active && "hidden lg:flex",
          )}
        >
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Поиск по диалогам"
                aria-label="Поиск по диалогам"
                className="h-10 pl-9"
              />
            </div>
          </div>

          <div className="thin-scrollbar min-h-0 flex-1 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                Диалогов не найдено
              </p>
            ) : (
              <ChatList conversations={filtered} activeId={activeId} onSelect={select} />
            )}
          </div>
        </div>

        {active ? (
          <ChatWindow
            conversation={active}
            onSend={(text) => sendMessage(active.id, text)}
            onBack={() => setActiveId(null)}
            className={cn("min-h-0", !active && "hidden")}
          />
        ) : (
          <div className="hidden items-center justify-center p-8 lg:flex">
            <EmptyState
              icon={MessagesSquare}
              title="Выберите диалог"
              description="Здесь появятся переписки с продавцами по объявлениям, которые вы смотрели."
              className="border-0 bg-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
}
