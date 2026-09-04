import { FileQuestion } from "lucide-react";
import { EmptyState } from "@/components/listings/empty-state";

export default function NotFound() {
  return (
    <div className="container py-20">
      <EmptyState
        icon={FileQuestion}
        title="Страница не найдена"
        description="Объявление снято с публикации или ссылка введена неверно."
        action={{ label: "На главную", href: "/" }}
        secondaryAction={{ label: "Все объявления", href: "/search" }}
      />
    </div>
  );
}
