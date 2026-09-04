"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  className?: string;
  defaultQuery?: string;
}

/** Single search field for the whole app: submits on Enter, routes to /search. */
export function SearchBar({ className, defaultQuery = "" }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState(defaultQuery);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : "/search");
  }

  return (
    <form onSubmit={submit} className={cn("w-full", className)} role="search">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Поиск по объявлениям"
          aria-label="Поиск по объявлениям"
          className="h-11 rounded-xl pl-11 pr-4 text-[15px]"
        />
      </div>
    </form>
  );
}
