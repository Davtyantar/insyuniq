import type { ReactNode } from "react";
import { Logo } from "@/components/layout/logo";

interface AuthShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}

/**
 * Shared shell for the sign-in/sign-up forms: a logo-topped hero band using the same dotted
 * pattern as the home page's promo banner, sitting above the actual form card instead of a
 * plain heading — so the auth pages read as part of the same brand, not a bare system form.
 */
export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Page-wide dotted pattern — the same treatment as the home page's promo banner — plus a
          soft accent wash, both fading out toward the edges so the form card stays the focus. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_1px_1px,rgba(37,99,246,0.35)_1.6px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(15,23,42,0.18)_1.2px,transparent_0)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent_78%)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(147,197,253,0.4)_1.6px,transparent_0),radial-gradient(circle_at_13px_13px,rgba(226,232,240,0.16)_1.2px,transparent_0)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(37,99,246,0.10),transparent)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,rgba(147,197,253,0.12),transparent)]"
      />

      <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10 md:py-16">
        <div className="w-full max-w-md animate-slide-up">
          <div className="overflow-hidden rounded-3xl bg-card shadow-lift ring-1 ring-black/5 dark:ring-white/10">
            <div className="bg-gradient-to-b from-secondary to-card px-6 pb-7 pt-7 text-center sm:px-8 sm:pb-8 sm:pt-8">
              <div className="flex flex-col items-center gap-3">
                <Logo compact />
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">{title}</h1>
                  {subtitle && (
                    <p className="mx-auto mt-1.5 max-w-[300px] text-balance text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">{children}</div>
          </div>

          <p className="mt-5 text-center text-sm text-muted-foreground">{footer}</p>
        </div>
      </div>
    </div>
  );
}
