import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Sticky call bar that sits above the mobile bottom navigation. */
export function MobileContactBar({ phone }: { phone: string }) {
  return (
    <div className="fixed inset-x-0 bottom-14 z-30 flex gap-2 border-t border-border bg-card/95 p-3 backdrop-blur md:hidden">
      <Button variant="accent" className="flex-1 gap-2" asChild>
        <a href={`tel:${phone}`}>
          <Phone className="h-4 w-4" />
          {phone}
        </a>
      </Button>
    </div>
  );
}
