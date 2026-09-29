"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { KeyRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, authErrorKey, errorInputClass } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import type { AuthErrorCode } from "@/lib/account";
import { cn } from "@/lib/utils";

/** Landing page of the reset email. The browser Supabase client exchanges the link's `?code=`
 * for a session on load; without one the link was invalid or expired. */
export function ResetPasswordView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { hydrated, user, setNewPassword, localizeHref } = useApp();
  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [fieldError, setFieldError] = React.useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = React.useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next: typeof fieldError = {};
    if (password.length < 6) next.password = t("auth.signUp.passwordTooShort");
    if (confirm !== password) next.confirm = t("auth.signUp.passwordMismatch");
    setFieldError(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    const result = await setNewPassword(password);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(localizeHref("/profile"));
  }

  const linkInvalid = hydrated && !user;
  return (
    <AuthShell title={t("auth.resetPassword.title")} subtitle={linkInvalid ? undefined : t("auth.resetPassword.subtitle")}>
      {linkInvalid ? (
        <p className="text-center text-[13px] text-destructive">{t("auth.resetPassword.linkInvalid")}</p>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthField label={t("auth.signUp.passwordLabel")} htmlFor="reset-password" error={fieldError.password}>
            <PasswordInput
              id="reset-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              aria-invalid={!!fieldError.password}
              className={cn(fieldError.password && errorInputClass)}
            />
          </AuthField>
          <AuthField label={t("auth.signUp.confirmPasswordLabel")} htmlFor="reset-confirm" error={fieldError.confirm}>
            <PasswordInput
              id="reset-confirm"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              autoComplete="new-password"
              aria-invalid={!!fieldError.confirm}
              className={cn(fieldError.confirm && errorInputClass)}
            />
          </AuthField>
          {error && <p className="text-[13px] text-destructive">{t(authErrorKey(error))}</p>}
          <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitting || !hydrated}>
            <KeyRound className="h-4 w-4" />
            {submitting ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
