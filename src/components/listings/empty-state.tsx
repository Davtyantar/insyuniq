import { Link } from "@/components/i18n/locale-link";
import type { LucideIcon } from "lucide-react";
import { SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href?: string; onClick?: () => void };
  secondaryAction?: { label: string; href?: string; onClick?: () => void };
  className?: string;
}

export function EmptyState({
  icon: Icon = SearchX,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center",
        className,
      )}
    >
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <Icon className="h-6 w-6" />
      </span>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
      {(action || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {action &&
            (action.href ? (
              <Button asChild variant="accent">
                <Link href={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button variant="accent" onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          {secondaryAction &&
            (secondaryAction.href ? (
              <Button asChild variant="outline">
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            ))}
        </div>
      )}
    </div>
  );
}
