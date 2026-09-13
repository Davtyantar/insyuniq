"use client";

import { Link } from "@/components/i18n/locale-link";
import { usePathname } from "next/navigation";
import { Home, Plus, User, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguagePicker } from "@/components/layout/language-picker";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  primary?: boolean;
}

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex h-14 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        active ? "text-accent" : "text-muted-foreground",
      )}
    >
      <item.icon className={cn("h-5 w-5", item.primary && "rounded-md bg-accent p-0.5 text-white")} />
      {item.label}
    </Link>
  );
}

export function BottomNav() {
  const { t } = useTranslation();
  const pathname = usePathname();

  const LEADING_ITEM: NavItem = { href: "/", label: t("common.home"), icon: Home };
  const CENTER_ITEM: NavItem = { href: "/create", label: t("common.publish"), icon: Plus, primary: true };
  const TRAILING_ITEM: NavItem = { href: "/profile", label: t("common.profile"), icon: User };

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-4">
        <li>
          <NavLink
            item={LEADING_ITEM}
            active={pathname === "/"}
          />
        </li>

        <li>
          <LanguagePicker variant="bottomNav" />
        </li>

        <li>
          <NavLink item={CENTER_ITEM} active={pathname.startsWith(CENTER_ITEM.href)} />
        </li>

        <li>
          <NavLink item={TRAILING_ITEM} active={pathname.startsWith(TRAILING_ITEM.href)} />
        </li>
      </ul>
    </nav>
  );
}
