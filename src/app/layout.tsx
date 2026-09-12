import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { AppProvider } from "@/components/providers/app-provider";
import { JsonLd } from "@/components/seo/json-ld";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";
import { organizationJsonLd, websiteJsonLd } from "@/lib/structured-data";
import "./globals.css";

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
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
      </head>
      <body className="flex min-h-screen flex-col pb-14 md:pb-0">
        <AppProvider>
          <Header />
          <SearchOverlay />
          <main className="flex-1">{children}</main>
          <Footer />
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
