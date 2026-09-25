import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseConfig } from "./env";

/** Refreshes the session cookies on every request and reports whether someone is signed in.
 * `makeResponse` rebuilds the caller's response (a locale rewrite or a plain next) whenever
 * Supabase sets cookies, so both survive. */
export async function refreshSession(
  request: NextRequest,
  makeResponse: () => NextResponse,
): Promise<{ response: NextResponse; signedIn: boolean }> {
  let response = makeResponse();
  const config = supabaseConfig();
  if (!config) return { response, signedIn: false };

  const supabase = createServerClient(config.url, config.key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = makeResponse();
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  try {
    // Verifies the access token against the project's JWKS (ES256, no round trip while it is
    // valid) and refreshes it when expired.
    const { data } = await supabase.auth.getClaims();
    return { response, signedIn: Boolean(data?.claims?.sub) };
  } catch (error) {
    console.error("Supabase session refresh failed", error);
    return { response, signedIn: false };
  }
}
