import { type NextRequest, NextResponse } from "next/server";
import { isProtectedPath } from "@/lib/auth-routes";
import { localeFromPathname, stripLocalePrefix, withLocalePrefix } from "@/lib/i18n";
import { refreshSession } from "@/lib/supabase/middleware";

/**
 * 1. Serves /ru/* and /en/* by rewriting to the unprefixed route; Armenian stays unprefixed.
 * 2. Refreshes the Supabase session cookies on every page request.
 * 3. Sends signed-out visitors of /create and /profile to sign-in, remembering where they were.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const locale = localeFromPathname(pathname);
  const path = stripLocalePrefix(pathname);

  const makeResponse = () => {
    if (locale === "am") return NextResponse.next({ request });
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.rewrite(url, { request });
  };

  const { response, signedIn } = await refreshSession(request, makeResponse);
  if (signedIn || !isProtectedPath(pathname)) return response;

  const target = request.nextUrl.clone();
  target.pathname = withLocalePrefix("/sign-in", locale);
  target.search = `?next=${encodeURIComponent(path + search)}`;
  const redirect = NextResponse.redirect(target);
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}

export const config = {
  // Skip Next internals and any request for a file with an extension
  // (robots.txt, sitemap.xml, manifest.webmanifest, icon.png, etc.).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
