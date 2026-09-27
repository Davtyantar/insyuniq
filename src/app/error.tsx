"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

/** Shown when a page's API call fails for any reason other than a 404. `reset()` alone does not
 * refetch a server-rendered page in Next 14, so retry also refreshes the router's cache. */
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  return (
    <div className="container flex flex-col items-center py-20 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Չհաջողվեց բեռնել էջը</h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Կապը սերվերի հետ ընդհատվեց։ Ստուգեք ինտերնետը և փորձեք կրկին։
      </p>
      <Button
        variant="accent"
        className="mt-6"
        disabled={pending}
        onClick={() => {
          startTransition(() => {
            router.refresh();
            reset();
          });
        }}
      >
        Կրկին փորձել
      </Button>
    </div>
  );
}
