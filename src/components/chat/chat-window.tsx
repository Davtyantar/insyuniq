"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Phone, Send } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listingHref } from "@/lib/categories";
import { formatPrice, formatTime } from "@/lib/format";
import { isMonthly } from "@/lib/specs";
import type { Conversation } from "@/lib/types";
import { cn } from "@/lib/utils";
import { getListing } from "@/mock/listings";
import { getSeller } from "@/mock/sellers";
import { SELLER_TYPES } from "@/mock/taxonomy";

interface ChatWindowProps {
  conversation: Conversation;
  onSend: (text: string) => void;
  onBack?: () => void;
  className?: string;
}

export function ChatWindow({ conversation, onSend, onBack, className }: ChatWindowProps) {
  const seller = getSeller(conversation.sellerId);
  const listing = getListing(conversation.listingId);
  const [text, setText] = React.useState("");
  const endRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [conversation.id, conversation.messages.length]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className={cn("flex min-h-0 flex-col bg-background", className)}>
      <header className="flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        {onBack && (
          <Button variant="ghost" size="icon-sm" onClick={onBack} className="lg:hidden">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Назад к диалогам</span>
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={seller.avatar} alt={seller.name} />
          <AvatarFallback>{seller.name.slice(0, 1)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{seller.name}</p>
          <p className="text-[12px] text-muted-foreground">
            {seller.online ? "в сети" : SELLER_TYPES[seller.type]}
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Phone className="h-4 w-4" />
          <span className="hidden sm:inline">Позвонить</span>
        </Button>
      </header>

      {listing && (
        <Link
          href={listingHref(listing)}
          className="flex items-center gap-3 border-b border-border bg-card px-4 py-2.5 transition-colors hover:bg-secondary/60"
        >
          <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-md">
            <Image src={listing.images[0]} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{listing.title}</p>
            <p className="text-[13px] text-muted-foreground">
              {formatPrice(listing.price, { perMonth: isMonthly(listing) })}
            </p>
          </div>
        </Link>
      )}

      <div className="thin-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {conversation.messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.from === "me" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[78%] rounded-lg px-3.5 py-2 text-[14px] leading-relaxed",
                message.from === "me"
                  ? "rounded-br-sm bg-accent text-accent-foreground"
                  : "rounded-bl-sm border border-border bg-card",
              )}
            >
              {message.text}
              <span
                className={cn(
                  "mt-1 block text-[10px]",
                  message.from === "me" ? "text-white/70" : "text-muted-foreground",
                )}
              >
                {formatTime(message.sentAt)}
              </span>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={submit}
        className="flex items-center gap-2 border-t border-border bg-card p-3"
      >
        <Input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Напишите сообщение…"
          aria-label="Текст сообщения"
          className="h-11"
        />
        <Button type="submit" variant="accent" size="icon" className="h-11 w-11 shrink-0">
          <Send className="h-4 w-4" />
          <span className="sr-only">Отправить</span>
        </Button>
      </form>
    </div>
  );
}
