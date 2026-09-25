"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseConfig } from "./env";

let client: SupabaseClient | null = null;

/** One client per tab. It keeps the session in cookies the middleware can read, and exchanges
 * the `?code=` of email links (password reset) automatically. */
export function browserSupabase(): SupabaseClient | null {
  if (client) return client;
  const config = supabaseConfig();
  if (!config) return null;
  client = createBrowserClient(config.url, config.key);
  return client;
}
