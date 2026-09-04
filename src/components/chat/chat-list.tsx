"use client";

import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeDate } from "@/lib/format";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getListing } from "@/mock/listings";
import { getSeller } from "@/mock/sellers";

interface ChatListProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  className?: string;
}

export function ChatList({ conversations, activeId, onSelect, className }: ChatListProps) {
  return (
    <ul className={cn("divide-y divide-border", className)}>
      {conversations.map((conversation) => {
        const seller = getSeller(conversation.sellerId);
        const listing = getListing(conversation.listingId);
        const last = conversation.messages[conversation.messages.length - 1];
        const active = conversation.id === activeId;

        return (
          <li key={conversation.id}>
            <button
              type="button"
              onClick={() => onSelect(conversation.id)}
              className={cn(
                "flex w-full items-start gap-3 px-4 py-3.5 text-left transition-colors hover:bg-secondary/60",
                active && "bg-secondary",
              )}
            >
              <div className="relative shrink-0">
                <Avatar className="h-11 w-11">
                  <AvatarImage src={seller.avatar} alt={seller.name} />
                  <AvatarFallback>{seller.name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                {seller.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-card bg-emerald-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">{seller.name}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {formatRelativeDate(last.sentAt)}
                  </span>
                </div>
                {listing && (
                  <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                    {listing.title}
                  </p>
                )}
                <p
                  className={cn(
                    "mt-1 line-clamp-1 text-[13px]",
                    conversation.unread > 0 ? "font-medium text-foreground" : "text-muted-foreground",
                  )}
                >
                  {last.from === "me" && "Вы: "}
                  {last.text}
                </p>
              </div>

              {listing && (
                <div className="relative hidden h-11 w-11 shrink-0 overflow-hidden rounded-md sm:block">
                  <Image src={listing.images[0]} alt="" fill sizes="44px" className="object-cover" />
                </div>
              )}

              {conversation.unread > 0 && (
                <span className="mt-1 flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-accent-foreground">
                  {conversation.unread}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
