import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { SiteChrome } from "@/components/layout/site-chrome";
import { PWA_SPLASH_SCRIPT, PwaSplash } from "@/components/pwa/pwa-splash";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import { AppProvider } from "@/components/providers/app-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

/** iOS launch screens for the installed app, as [CSS width, CSS height, pixel ratio]. iOS shows a
 * black screen on launch unless one of these matches the device exactly; the files are white with
 * the transparent logo at 30% width, dead centre, generated into public/splash at width×ratio by
 * height×ratio. PwaSplash picks up from exactly that spot and spins it until the app is ready. */
const IOS_SPLASH_SCREENS: [number, number, number][] = [
  [440, 956, 3],
  [430, 932, 3],
  [402, 874, 3],
  [393, 852, 3],
  [428, 926, 3],
  [390, 844, 3],
  [375, 812, 3],
  [414, 896, 3],
  [414, 896, 2],
  [414, 736, 3],
  [375, 667, 2],
  [320, 568, 2],
  [1024, 1366, 2],
  [834, 1194, 2],
  [820, 1180, 2],
  [768, 1024, 2],
];

const SITE_DESCRIPTION =
  "Անշարժ գույքի և ավտոմեքենաների առք ու վաճառքի ու վարձակալության հայտարարություններ. բնակարաններ, տներ, հողատարածքներ, մարդատար և էլեկտրական մեքենաներ։";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "hy_AM",
    siteName: APP_NAME,
    url: "/",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [{ url: "/logo.png", width: 916, height: 272, alt: APP_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} — ${APP_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/logo.png"],
  },
  // iOS ignores the web manifest's icons for "Add to Home Screen" — it only looks at this tag.
  icons: { apple: "/syunik-icon.png" },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_NAME,
    startupImage: IOS_SPLASH_SCREENS.map(([width, height, ratio]) => ({
      url: `/splash/splash-${width * ratio}x${height * ratio}.png`,
      media: `(device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${ratio}) and (orientation: portrait)`,
    })),
  },
};

export const viewport: Viewport = {
  // Not media-conditional: the page always defaults to light regardless of the
  // OS/browser color-scheme preference, so the browser chrome matches that.
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

// Runs before hydration so the page never flashes the wrong theme.
// Always defaults to light — the OS/browser dark-mode preference is intentionally
// ignored so the site starts white until the user explicitly picks dark.
const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("syuniq:theme");
    if (stored === "dark") {
      document.documentElement.classList.add("dark");
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) meta.setAttribute("content", "#141a24");
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <script dangerouslySetInnerHTML={{ __html: PWA_SPLASH_SCRIPT }} />
        {/* The splash logo is requested before any stylesheet or script, so it's ready for the
            first frame of a launch. */}
        <link rel="preload" as="image" href="/syunik-icon-transparent.png" fetchPriority="high" />
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="flex min-h-screen flex-col">
        <PwaSplash />
        <AppProvider>
          <SiteChrome>{children}</SiteChrome>
        </AppProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
