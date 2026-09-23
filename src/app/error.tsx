"use client";

import { Button } from "@/components/ui/button";

/** Shown when a page's API call fails for any reason other than a 404. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Չհաջողվեց բեռնել էջը</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Կապը սերվերի հետ ընդհատվեց։ Ստուգեք ինտերնետը և փորձեք կրկին։
      </p>
      <Button variant="accent" className="mt-6" onClick={reset}>
        Կրկին փորձել
      </Button>
    </div>
  );
}
