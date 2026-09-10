import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CtaButtonProps {
  href: string;
  children: React.ReactNode;
  size?: ButtonProps["size"];
  className?: string;
}

/**
 * The site's primary call-to-action button — accent blue, darkens on hover (via the
 * "accent" Button variant), with a trailing arrow that nudges forward on hover.
 * Reusable anywhere the same treatment is needed, not just the "publish a listing" CTA.
 */
export function CtaButton({ href, children, size = "lg", className }: CtaButtonProps) {
  return (
    <Button asChild size={size} variant="accent" className={cn("group gap-2", className)}>
      <Link href={href}>
        {children}
        <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </Button>
  );
}
