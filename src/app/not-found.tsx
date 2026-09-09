import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/listings/empty-state";

export default function NotFound() {
  return (
    <div className="container py-20">
      <EmptyState
        icon={FileQuestion}
        title="Էջը չի գտնվել"
        description="Հայտարարությունը հանվել է հրապարակումից, կամ հղումը սխալ է մուտքագրվել։"
        action={{ label: "Գլխավոր էջ", href: "/" }}
        secondaryAction={{ label: "Բոլոր հայտարարությունները", href: "/search" }}
      />
    </div>
  );
}
