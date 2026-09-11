"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface FloatingTabItem {
  value: string;
  label: string;
}

interface FloatingTabsProps {
  items: FloatingTabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  tabClassName?: string;
}

/** Segmented control with a floating pill that glides to the active tab. Reusable across search & category pages. */
export function FloatingTabs({ items, value, onChange, className, tabClassName }: FloatingTabsProps) {
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = React.useState<{ left: number; width: number } | null>(null);
  const [animate, setAnimate] = React.useState(false);

  const updateIndicator = React.useCallback(() => {
    const el = tabRefs.current.get(value);
    if (!el) return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  }, [value]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [updateIndicator, items]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setAnimate(true));
    const onResize = () => updateIndicator();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", onResize);
    };
  }, [updateIndicator]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1 no-scrollbar",
        className,
      )}
    >
      {indicator && (
        <div
          className="absolute inset-y-1 rounded-md bg-primary"
          style={{
            left: indicator.left,
            width: indicator.width,
            transition: animate
              ? "left 320ms cubic-bezier(0.22, 1, 0.36, 1), width 320ms cubic-bezier(0.22, 1, 0.36, 1)"
              : undefined,
          }}
          aria-hidden
        />
      )}
      {items.map((item) => (
        <button
          key={item.value}
          ref={(el) => {
            if (el) tabRefs.current.set(item.value, el);
            else tabRefs.current.delete(item.value);
          }}
          type="button"
          onClick={() => onChange(item.value)}
          className={cn(
            "relative z-10 inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            value === item.value
              ? "text-primary-foreground"
              : "text-muted-foreground hover:text-foreground",
            tabClassName,
          )}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
