import * as React from "react";
import { Label } from "@/components/ui/label";
import type { AuthErrorCode } from "@/lib/account";
import { cn } from "@/lib/utils";

export function AuthField({
  label,
  htmlFor,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} className="mb-1.5 block">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="mt-1.5 animate-slide-up text-[12px] text-destructive">{error}</p>
      ) : hint ? (
        <p className="mt-1.5 text-[12px] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export const errorInputClass = cn(
  "border-destructive focus-visible:border-destructive",
);

const ERROR_KEY: Record<AuthErrorCode, string> = {
  "not-configured": "auth.errors.notConfigured",
  "invalid-credentials": "auth.signIn.invalidCredentials",
  "email-taken": "auth.errors.emailTaken",
  "weak-password": "auth.errors.weakPassword",
  "invalid-phone": "auth.errors.invalidPhone",
  "rate-limited": "auth.errors.rateLimited",
  network: "auth.errors.network",
  unknown: "auth.errors.unknown",
};

export function authErrorKey(code: AuthErrorCode): string {
  return ERROR_KEY[code];
}
