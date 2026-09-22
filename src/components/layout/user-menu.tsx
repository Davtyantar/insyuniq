"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { LogOut, Package, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useApp, type AuthUser } from "@/components/providers/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** The signed-in account menu behind the header avatar: who you are, then the two profile tabs
 * and sign-out. `children` is the trigger, so desktop's bare avatar and the phone's labelled
 * pill share one menu. */
export function UserMenu({
  user,
  endRef,
  children,
}: {
  user: AuthUser;
  /** When given, the menu opens from the trigger's left edge and stretches to this element's
   * right edge (desktop: the publish button), so it reads as hanging off that whole cluster. */
  endRef?: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { signOut } = useApp();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [width, setWidth] = React.useState<number>();

  function handleOpenChange(open: boolean) {
    if (!open || !endRef?.current || !triggerRef.current) return;
    const span = endRef.current.getBoundingClientRect().right - triggerRef.current.getBoundingClientRect().left;
    setWidth(Math.max(240, Math.round(span)));
  }

  return (
    <DropdownMenu modal={false} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger ref={triggerRef} asChild>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={endRef ? "start" : "end"}
        collisionPadding={16}
        className="w-60"
        style={endRef && width ? { width } : undefined}
      >
        <div className="flex items-center gap-3 px-2.5 py-2">
          <Avatar className="h-9 w-9">
            {user.avatar && <AvatarImage src={user.avatar} alt="" />}
            <AvatarFallback className="text-sm font-semibold">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email || user.phone}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Package className="h-4 w-4 text-muted-foreground" />
            {t("profile.tabs.listings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile?tab=settings">
            <Settings className="h-4 w-4 text-muted-foreground" />
            {t("profile.tabs.settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={signOut} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
          <LogOut className="h-4 w-4" />
          {t("profile.signOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
