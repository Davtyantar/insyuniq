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
      <rect y="0" width="30" height="2.22" fill="#b22234" />
      <rect y="4.44" width="30" height="2.22" fill="#b22234" />
      <rect y="8.88" width="30" height="2.22" fill="#b22234" />
      <rect y="13.32" width="30" height="2.22" fill="#b22234" />
      <rect y="17.76" width="30" height="2.22" fill="#b22234" />
      <rect width="13" height="11.1" fill="#3c3b6e" />
      <g fill="#fff">
        <circle cx="2.2" cy="1.9" r="0.55" />
        <circle cx="5.2" cy="1.9" r="0.55" />
        <circle cx="8.2" cy="1.9" r="0.55" />
        <circle cx="11.2" cy="1.9" r="0.55" />
        <circle cx="3.7" cy="4.1" r="0.55" />
        <circle cx="6.7" cy="4.1" r="0.55" />
        <circle cx="9.7" cy="4.1" r="0.55" />
        <circle cx="2.2" cy="6.3" r="0.55" />
        <circle cx="5.2" cy="6.3" r="0.55" />
        <circle cx="8.2" cy="6.3" r="0.55" />
        <circle cx="11.2" cy="6.3" r="0.55" />
        <circle cx="3.7" cy="8.5" r="0.55" />
        <circle cx="6.7" cy="8.5" r="0.55" />
        <circle cx="9.7" cy="8.5" r="0.55" />
      </g>
    </svg>
  );
}
