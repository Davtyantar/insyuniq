"use client";

import * as React from "react";

/** Registers /sw.js (see public/sw.js) so the installed app opens straight from cache. Production
 * only — in `next dev` a caching worker would keep serving stale pages over hot reloads. */
export function ServiceWorkerRegister() {
  React.useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    // After load, so registering never competes with the first paint for bandwidth.
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // No worker just means launches go to the network as before.
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}
