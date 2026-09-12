"use client";

import * as React from "react";
import { ChevronDown, Globe } from "lucide-react";
import { Link } from "@/components/i18n/locale-link";
import { FlagIcon } from "@/components/layout/flag-icon";
import { useApp } from "@/components/providers/app-provider";
import { CATEGORY_LIST } from "@/lib/categories";
import { CURRENCY_OPTIONS, currencyOption } from "@/lib/currency";
import { LOCALE_OPTIONS } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const SECTION_LANGUAGE = "language";
// How long the exit transition runs — must match the duration-200 below, so the
// panel stays mounted (and animating out) instead of vanishing instantly.
const EXIT_MS = 200;

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  /** The burger button that toggles this panel — clicking it isn't an "outside" click. */
  triggerRef: React.RefObject<HTMLElement | null>;
}

/** Panel that drops in directly under the phone header's burger/search row: categories (with
 * subcategory accordions) plus language/currency — the desktop header's city, theme, and
 * sign-in controls already have their own spot in the persistent phone header above this.
 * Stays anchored to the sticky header instead of covering the screen, so that row never
 * disappears. */
export function MobileMenu({ open, onClose, triggerRef }: MobileMenuProps) {
  const { locale, setLocale, currency, setCurrency } = useApp();
  const [section, setSection] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setSection(null);
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    }
    setVisible(false);
    const timeout = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(timeout);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      onClose();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose, triggerRef]);

  function toggleSection(key: string) {
    setSection((current) => (current === key ? null : key));
  }

  const activeCurrency = currencyOption(currency);
  const localeLabel = LOCALE_OPTIONS.find((option) => option.value === locale)?.label ?? locale;

  if (!mounted) return null;

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute left-0 right-0 top-full z-40 max-h-[calc(100svh-8rem)] overflow-y-auto rounded-b-2xl border-t border-border bg-card shadow-pop transition-all duration-200 ease-out",
        visible ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
      )}
    >
      <div className="thin-scrollbar px-3 pb-4 pt-1">
          {CATEGORY_LIST.map((category) => {
            const expanded = section === category.slug;
            return (
              <div key={category.slug} className="border-b border-border/70">
                <div className="flex items-center">
                  <Link
                    href={category.href}
                    onClick={onClose}
                    className="flex flex-1 items-center gap-3 py-3.5 text-[15px] font-medium text-foreground"
                  >
                    <category.icon className="h-5 w-5 shrink-0 text-accent" />
                    {category.label}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleSection(category.slug)}
                    aria-label={category.label}
                    aria-expanded={expanded}
                    className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground"
                  >
                    <ChevronDown className={cn("h-4 w-4 transition-transform", expanded && "rotate-180")} />
                  </button>
                </div>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div
                      className={cn(
                        "flex flex-col gap-0.5 pb-3 pl-8 transition-opacity duration-300",
                        expanded ? "opacity-100 delay-100" : "opacity-0",
                      )}
                    >
                      {category.subcategories.map((sub) => (
                        <Link
                          key={sub.value}
                          href={`${category.href}?subcategory=${sub.value}`}
                          onClick={onClose}
                          className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] text-muted-foreground transition-colors hover:bg-secondary/70 hover:text-foreground"
                        >
                          {sub.icon && <sub.icon className="h-4 w-4 shrink-0" />}
                          {sub.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div>
            <button
              type="button"
              onClick={() => toggleSection(SECTION_LANGUAGE)}
              aria-expanded={section === SECTION_LANGUAGE}
              className="flex w-full items-center gap-3 py-3.5 text-left text-[15px] font-medium text-foreground"
            >
              <Globe className="h-5 w-5 shrink-0 text-accent" />
              <span className="min-w-0 flex-1 truncate">
                {localeLabel} · {activeCurrency.value}
              </span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                  section === SECTION_LANGUAGE && "rotate-180",
                )}
              />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-out",
                section === SECTION_LANGUAGE ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden">
                <div
                  className={cn(
                    "flex flex-col gap-3 pb-4 pl-8 transition-opacity duration-300",
                    section === SECTION_LANGUAGE ? "opacity-100 delay-100" : "opacity-0",
                  )}
                >
                  <div className="flex flex-wrap gap-2">
                    {LOCALE_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setLocale(option.value)}
                        aria-label={option.label}
                        aria-pressed={locale === option.value}
                        className={cn(
                          "flex h-10 w-12 items-center justify-center rounded-lg border transition-colors",
                          locale === option.value
                            ? "border-accent ring-1 ring-accent"
                            : "border-border hover:border-accent/50",
                        )}
                      >
                        <FlagIcon locale={option.value} className="h-4 w-6" />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CURRENCY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setCurrency(option.value)}
                        aria-pressed={currency === option.value}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-[13px] font-medium transition-colors",
                          currency === option.value
                            ? "border-accent text-accent"
                            : "border-border text-muted-foreground hover:border-accent/50 hover:text-foreground",
                        )}
                      >
                        {option.value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
