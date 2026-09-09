"use client";

import type { MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

/** Wordmark lockup — the source file already contains the name, so no extra text here. */
export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  const pathname = usePathname();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (pathname !== "/") return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <Link
      href="/"
      aria-label={APP_NAME}
      onClick={handleClick}
      className={cn("shrink-0 transition-opacity hover:opacity-80", className)}
    >
      <Image
        src="/logo.png"
        alt={APP_NAME}
        width={765}
        height={235}
        priority
        className={cn("w-auto", compact ? "h-7" : "h-7 md:h-9")}
      />
    </Link>
  );
}
