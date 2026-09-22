import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

/**
 * Desktop hover call-to-action for the home page's video tiles: a brand-blue tint fades in and the
 * pill slides up into the bottom-left corner. The parent link must carry `group`. Phones get their own
 * always-visible label under the video instead.
 */
export function VideoHoverCta({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 z-10 hidden bg-accent/35 opacity-0 transition-opacity duration-300 sm:block sm:group-hover:opacity-100 sm:group-focus-visible:opacity-100'
      />
      <div
        aria-hidden
        className='pointer-events-none absolute bottom-4 left-4 z-10 hidden translate-y-3 opacity-0 transition-all duration-300 ease-out sm:block sm:group-hover:translate-y-0 sm:group-hover:opacity-100 sm:group-focus-visible:translate-y-0 sm:group-focus-visible:opacity-100 md:bottom-5 md:left-5'
      >
        <span className='inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-accent shadow-lg ring-1 ring-black/5'>
          {children}
          <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5' />
        </span>
      </div>
    </>
  );
}
