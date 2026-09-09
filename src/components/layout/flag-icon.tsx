import type { Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Drawn inline instead of relying on emoji flags, which some systems render as plain text. */
export function FlagIcon({ locale, className }: { locale: Locale; className?: string }) {
  const shared = cn("h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10", className);

  if (locale === "ru") {
    return (
      <svg viewBox="0 0 30 20" className={shared} aria-hidden="true">
        <rect width="30" height="20" fill="#fff" />
        <rect width="30" height="6.7" y="6.7" fill="#0039a6" />
        <rect width="30" height="6.7" y="13.3" fill="#d52b1e" />
      </svg>
    );
  }

  if (locale === "am") {
    return (
      <svg viewBox="0 0 30 20" className={shared} aria-hidden="true">
        <rect width="30" height="6.7" fill="#d90012" />
        <rect width="30" height="6.7" y="6.7" fill="#0033a0" />
        <rect width="30" height="6.7" y="13.3" fill="#f2a800" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 30 20" className={shared} aria-hidden="true">
      <rect width="30" height="20" fill="#fff" />
      <rect x="12" width="6" height="20" fill="#ce1124" />
      <rect y="7" width="30" height="6" fill="#ce1124" />
    </svg>
  );
}
