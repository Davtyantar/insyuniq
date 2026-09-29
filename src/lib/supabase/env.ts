/** Both values are public (the publishable key is meant for browsers). Read with literal
 * `process.env.NEXT_PUBLIC_…` references so Next inlines them into client bundles. */
export function supabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}
