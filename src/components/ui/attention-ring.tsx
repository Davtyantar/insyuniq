import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Wraps a control in a crisp light border plus a soft glow, and every few seconds a thin beam
 * of light "winks" across it — a quick, occasional flash rather than constant motion, so it
 * stays noticeable without being distracting to sit next to all the time.
 */
export function AttentionRing({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-md border border-white/40 shadow-[0_0_0_3px_hsl(var(--accent)/0.16),0_6px_16px_-4px_hsl(var(--accent)/0.55)]",
        className,
      )}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -skew-x-[20deg] animate-wink bg-gradient-to-r from-transparent via-white/70 to-transparent"
      />
    </div>
  );
}
