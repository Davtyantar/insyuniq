"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter, useSearchParams } from "next/navigation";
import { CircleAlert, LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, authErrorKey, errorInputClass } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthErrorCode } from "@/lib/account";
import { safeNextPath } from "@/lib/account";
import { cn } from "@/lib/utils";

interface FormErrors {
  login?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignInView() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, localizeHref } = useApp();

  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [authError, setAuthError] = React.useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!EMAIL_PATTERN.test(login.trim())) nextErrors.login = t("auth.signIn.loginError");
    if (!password) nextErrors.password = t("auth.signIn.passwordError");
    setErrors(nextErrors);
    setAuthError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await signIn(login, password);
    setSubmitting(false);
    if (!result.ok) {
      setAuthError(result.error);
      return;
    }
    router.push(localizeHref(safeNextPath(searchParams.get("next"))));
  }

  return (
    <AuthShell
      title={t("auth.signIn.title")}
      footer={
        <>
          {t("auth.signIn.noAccount")}{" "}
          <Link href="/sign-up" className="font-medium text-accent hover:underline">
            {t("auth.signIn.signUpLink")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <AuthField label={t("auth.signIn.loginLabel")} htmlFor="signin-login" error={errors.login}>
          <Input
            id="signin-login"
            type="email"
            value={login}
            onChange={(event) => {
              setLogin(event.target.value);
              setAuthError(null);
            }}
            placeholder={t("auth.signIn.loginPlaceholder")}
            autoComplete="email"
            aria-invalid={!!errors.login}
            className={cn(errors.login && errorInputClass)}
          />
        </AuthField>

        <AuthField label={t("auth.signIn.passwordLabel")} htmlFor="signin-password" error={errors.password}>
          <PasswordInput
            id="signin-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              setAuthError(null);
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className={cn(errors.password && errorInputClass)}
          />
        </AuthField>

        {authError && (
          <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {t(authErrorKey(authError))}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link href="/forgot-password" className="text-[13px] font-medium text-accent hover:underline">
            {t("auth.signIn.forgotPassword")}
          </Link>
        </div>

        <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitting}>
          <LogIn className="h-4 w-4" />
          {submitting ? t("auth.signIn.submitting") : t("auth.signIn.submit")}
        </Button>
      </form>
    </AuthShell>
  );
}
