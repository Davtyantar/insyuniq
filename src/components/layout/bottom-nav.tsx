"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, Plus, Search, User } from "lucide-react";
import { useApp } from "@/components/providers/app-provider";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/", label: "Գլխավոր", icon: Home },
  { href: "/search", label: "Որոնում", icon: Search },
  { href: "/create", label: "Հրապարակել", icon: Plus, primary: true },
  { href: "/favorites", label: "Հավանածներ", icon: Heart, badge: "favorites" as const },
  { href: "/profile", label: "Պրոֆիլ", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const { favorites, hydrated } = useApp();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const count = item.badge === "favorites" ? (hydrated ? favorites.length : 0) : 0;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
                  active ? "text-accent" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <item.icon
                    className={cn("h-5 w-5", item.primary && "rounded-md bg-accent p-0.5 text-white")}
                  />
                  {count > 0 && (
                    <span className="absolute -right-2 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-destructive px-1 text-[9px] font-semibold leading-none text-destructive-foreground">
                      {count > 9 ? "9+" : count}
                    </span>
                  )}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
