import { MapPin, Navigation } from "lucide-react";

interface MapPlaceholderProps {
  address: string;
  coords: { lat: number; lng: number };
}

/** Static stand-in for a real map tile provider. */
export function MapPlaceholder({ address, coords }: MapPlaceholderProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div
        className="relative flex h-[260px] items-center justify-center bg-secondary md:h-[320px]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        role="img"
        aria-label={`Քարտեզ․ ${address}`}
      >
        <div className="flex flex-col items-center gap-2 rounded-lg bg-card/90 px-5 py-4 text-center shadow-card backdrop-blur">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
            <MapPin className="h-5 w-5" />
          </span>
          <p className="text-sm font-medium">{address}</p>
          <p className="text-[12px] text-muted-foreground">
            {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border bg-card px-4 py-3 text-[13px]">
        <span className="text-muted-foreground">Ճշգրիտ գտնվելու վայրը ցույց է տալիս վաճառողը</span>
        <span className="inline-flex items-center gap-1.5 font-medium text-accent">
          <Navigation className="h-3.5 w-3.5" />
          Կառուցել երթուղին
        </span>
      </div>
    </div>
  );
}
