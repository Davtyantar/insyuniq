"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { CheckCircle2, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ForgotPasswordView() {
  const { t } = useTranslation();
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError(t("auth.forgotPassword.emailError"));
      return;
    }
    setError(undefined);
    setSubmitting(true);
    // No backend behind this form — mimic a short round trip, then show the confirmation.
    window.setTimeout(() => {
      setSubmitting(false);
      setSent(true);
    }, 450);
  }

  return (
    <AuthShell
      title={t("auth.forgotPassword.title")}
      subtitle={sent ? undefined : t("auth.forgotPassword.subtitle")}
      footer={
        <Link href="/sign-in" className="font-medium text-accent hover:underline">
          {t("auth.forgotPassword.backToSignInLink")}
        </Link>
      }
    >
      {/* Keying each state's root forces a clean remount when switching, so the slide-up
          animation replays instead of the DOM just mutating in place. */}
      {sent ? (
        <div key="sent" className="animate-slide-up space-y-4 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold">{t("auth.forgotPassword.sentTitle")}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {t("auth.forgotPassword.sentDescription", { email })}
            </p>
          </div>
          <Button type="button" variant="outline" className="w-full" onClick={() => setSent(false)}>
            {t("auth.forgotPassword.resend")}
          </Button>
        </div>
      ) : (
        <form key="form" onSubmit={handleSubmit} noValidate className="animate-slide-up space-y-4">
          <AuthField label={t("auth.forgotPassword.emailLabel")} htmlFor="forgot-email" error={error}>
            <Input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (error) setError(undefined);
              }}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!error}
              className={cn(error && errorInputClass)}
            />
          </AuthField>

          <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitting}>
            <Mail className="h-4 w-4" />
            {submitting ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
