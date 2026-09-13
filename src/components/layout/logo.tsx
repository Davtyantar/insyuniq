"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import { Link } from "@/components/i18n/locale-link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { stripLocalePrefix } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Wordmark lockup — the source file already contains the name, so no extra text here. */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    // `Link` here localizes href="/" to the current locale's home ("/ru", "/en", ...), so a click
    // on any locale's homepage resolves to the same URL — Next.js treats that as a no-op
    // navigation and never scrolls. Comparing the de-localized pathname instead of a literal "/"
    // catches "already home" regardless of which locale that is.
    if (stripLocalePrefix(pathname) !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Link
      href="/"
      aria-label={APP_NAME}
      onClick={handleClick}
      className={cn("shrink-0 rounded-lg transition-opacity hover:opacity-80", className)}
    >
      <Image
        src="/logo.png"
        alt={APP_NAME}
        width={765}
        height={235}
        priority
        className={cn("w-auto dark:hidden", compact ? "h-7" : "h-7 md:h-9")}
      />
      <Image
        src="/logo-white.png"
        alt={APP_NAME}
        width={765}
        height={235}
        priority
        className={cn("hidden w-auto dark:block", compact ? "h-7" : "h-7 md:h-9")}
      />
    </Link>
  );
}
