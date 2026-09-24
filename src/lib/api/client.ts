import createClient from "openapi-fetch";
import { toApiError } from "./errors";
import type { paths } from "./schema";

const LOCAL_API = "http://localhost:5080";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Server: API_URL, then NEXT_PUBLIC_API_URL. Browser: NEXT_PUBLIC_API_URL (inlined at build).
 * In production, an unset URL is a misconfiguration, not a silent fallback to localhost. */
export function apiBaseUrl(): string {
  const serverUrl = typeof window === "undefined" ? process.env.API_URL : undefined;
  const configured = serverUrl || process.env.NEXT_PUBLIC_API_URL;
  if (!configured) {
    if (process.env.NODE_ENV === "production") throw new Error("NEXT_PUBLIC_API_URL is not set");
    return LOCAL_API;
  }
  return configured.replace(/\/$/, "");
}

export interface ApiOptions {
  /** A Supabase access token; sent as `Authorization: Bearer`. */
  token?: string;
  /** Injected in tests; defaults to the global fetch (Next's patched fetch on the server). */
  fetch?: typeof fetch;
}

/** Stateless and isomorphic: create one per request on the server, per call in the browser. */
export function createApi(options: ApiOptions = {}) {
  const client = createClient<paths>({
    baseUrl: apiBaseUrl(),
    fetch: options.fetch,
    headers: { Accept: "application/json" },
  });
  const { token } = options;
  if (token) {
    client.use({
      onRequest({ request }) {
        request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      },
    });
  }
  return client;
}

export type Api = ReturnType<typeof createApi>;

/** The response data, or an `ApiError` built from the problem body. */
export function unwrap<R extends { data?: unknown; error?: unknown; response: Response }>(
  result: R,
): NonNullable<R["data"]> {
  if (result.error !== undefined || result.data === undefined || result.data === null) {
    throw toApiError(result.response.status, result.error);
  }
  return result.data as NonNullable<R["data"]>;
}

/** Listing ids are UUIDs; mock ids such as `re-1` never reach the API. */
export function isUuid(value: string): boolean {
  return UUID.test(value);
}
