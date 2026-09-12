import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import type { Locale } from "@/lib/i18n";
import { en } from "./resources/en";
import { hy } from "./resources/hy";
import { ru } from "./resources/ru";

/**
 * Armenian is the hard default — matches <html lang="hy"> in the root layout
 * and is what the server always renders, since the real locale only lives in
 * localStorage and is applied after hydration (see AppProvider). No browser
 * language auto-detection, by design, same as the light/dark theme default.
 */
export const DEFAULT_LOCALE: Locale = "am";

// Resources are bundled statically (no network fetch), so init can run
// synchronously at module load and be ready before the first render. Guarded
// against double-init from React StrictMode / Fast Refresh re-executing this module.
if (!i18next.isInitialized) {
  i18next.use(initReactI18next).init({
    lng: DEFAULT_LOCALE,
    fallbackLng: DEFAULT_LOCALE,
    resources: {
      am: { translation: hy },
      ru: { translation: ru },
      en: { translation: en },
    },
    interpolation: { escapeValue: false }, // React already escapes.
    react: { useSuspense: false },
  });
}

export { i18next };
