import { stripLocalePrefix } from "@/lib/i18n";

const PROTECTED = ["/create", "/profile"];

export function isProtectedPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return PROTECTED.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

const SAME_SITE = "http://same-site.invalid";

/** Only same-site paths survive, so ?next= can never send someone off-site after sign-in.
 * Control characters and backslashes are rejected outright (URL parsers strip or rewrite them),
 * then the path must resolve to the same placeholder origin. */
export function safeNextPath(next: string | null | undefined, fallback = "/profile"): string {
  if (!next || !next.startsWith("/") || next.includes("\\")) return fallback;
  for (const char of next) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return fallback;
  }
  let url: URL;
  try {
    url = new URL(next, SAME_SITE);
  } catch {
    return fallback;
  }
  return url.origin === SAME_SITE ? `${url.pathname}${url.search}${url.hash}` : fallback;
}
