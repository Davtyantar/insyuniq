import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { BottomNav } from "@/components/layout/bottom-nav";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { AppProvider } from "@/components/providers/app-provider";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} — ${APP_TAGLINE}`,
    template: `%s · ${APP_NAME}`,
  },
  description:
    "Անշարժ գույքի և ավտոմեքենաների առք ու վաճառքի ու վարձակալության հայտարարություններ. բնակարաններ, տներ, հողատարածքներ, մարդատար և էլեկտրական մեքենաներ։",
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
