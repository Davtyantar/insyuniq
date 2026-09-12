import { NextResponse, type NextRequest } from "next/server";
import { localeFromPathname, stripLocalePrefix } from "@/lib/i18n";

/**
 * Serves /ru/* and /en/* by rewriting internally to the unprefixed route —
 * every page keeps living at its one real path (e.g. app/cars/page.tsx); the
 * locale prefix is purely a URL-level concern. Armenian stays unprefixed.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromPathname(pathname);
  if (locale === "am") return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = stripLocalePrefix(pathname);
  return NextResponse.rewrite(url);
}

export const config = {
  // Skip Next internals and any request for a file with an extension
  // (robots.txt, sitemap.xml, manifest.webmanifest, icon.png, etc.).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
