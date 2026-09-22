"use client";

import * as React from "react";

/** One full turn. Slow enough to read as a calm showcase spin rather than a loading spinner. */
const TURN_MS = 2800;
/** Stay up for at least one full turn, so the spin never gets cut off a moment after it starts. */
const MIN_VISIBLE_MS = TURN_MS;
const FADE_MS = 450;
/** Stacked copies of the logo, spread along Z, give the flat PNG real thickness as it turns edge-on. */
const LAYERS = 12;
const DEPTH_PX = 9;

/**
 * Animated continuation of the iOS launch screen for the installed app: the same logo, in the
 * same spot (see IOS_SPLASH_SCREENS in app/layout.tsx and PWA_SPLASH_SCRIPT below), spinning in
 * place around its vertical axis until the app is ready, then fading away.
 *
 * It's in the server HTML so it paints on the very first frame after the static launch image —
 * rendered only on the client it would appear after hydration, leaving the page flashing through
 * in between. It stays `display: none` unless the pre-paint script flagged this load as a cold
 * start of the installed app, so ordinary browser tabs never see it.
 */
export function PwaSplash() {
  const [phase, setPhase] = React.useState<"visible" | "leaving" | "gone">("visible");

  React.useEffect(() => {
    if (!document.documentElement.classList.contains("pwa-launch")) {
      setPhase("gone");
      return;
    }
    const wait = Math.max(0, MIN_VISIBLE_MS - performance.now());
    const leave = window.setTimeout(() => setPhase("leaving"), wait);
    const remove = window.setTimeout(() => {
      setPhase("gone");
      document.documentElement.classList.remove("pwa-launch");
    }, wait + FADE_MS);
    return () => {
      window.clearTimeout(leave);
      window.clearTimeout(remove);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div aria-hidden className="pwa-splash" data-leaving={phase === "leaving" || undefined}>
      <div className="pwa-splash__stage">
        <div className="pwa-splash__shadow" />
        <div className="pwa-splash__spinner">
          {Array.from({ length: LAYERS }, (_, i) => {
            const z = (i / (LAYERS - 1) - 0.5) * DEPTH_PX;
            const isFace = i === 0 || i === LAYERS - 1;
            return (
              // eslint-disable-next-line @next/next/no-img-element -- must be in the first paint, unoptimized
              <img
                key={i}
                src="/syunik-icon-transparent.png"
                alt=""
                draggable={false}
                className="pwa-splash__layer"
                style={{
                  transform: `translateZ(${z.toFixed(2)}px)`,
                  // Inner layers form the rim: darker, like the side of a moulded plastic badge.
                  filter: isFace ? undefined : "brightness(0.62) saturate(1.15)",
                }}
              />
            );
          })}
          <div className="pwa-splash__gloss" style={{ transform: `translateZ(${DEPTH_PX / 2 + 0.1}px)` }} />
        </div>
      </div>
    </div>
  );
}

/**
 * Runs in <head> before the first paint. Flags a cold start of the installed app (not a regular
 * tab, and once per session so reloads don't replay it) and works out where the launch image's
 * centre lands in the web view: iOS draws the launch image across the whole screen, but with the
 * "default" status bar the page starts below the status bar, so the screen centre sits higher
 * than the viewport centre by that bar's height.
 */
export const PWA_SPLASH_SCRIPT = `
(function () {
  try {
    // "?splash=1" previews it in a normal browser tab, bypassing the once-per-session guard.
    var preview = /[?&]splash=1(&|$)/.test(location.search);
    var standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    if (!preview && (!standalone || sessionStorage.getItem("syuniq:splash"))) return;
    sessionStorage.setItem("syuniq:splash", "1");
    var root = document.documentElement;
    root.classList.add("pwa-launch");
    var top = Math.max(0, screen.height - window.innerHeight);
    if (top > 0 && top < 120) root.style.setProperty("--pwa-splash-y", (window.innerHeight - screen.height / 2) + "px");
  } catch (e) {}
})();
`;
