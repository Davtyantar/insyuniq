"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { PhoneOrEmailInput } from "@/components/ui/phone-or-email-input";
import { CURRENT_USER } from "@/mock/sellers";
import { cn } from "@/lib/utils";

interface FormErrors {
  login?: string;
  password?: string;
}

export function SignInView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signIn, localizeHref } = useApp();

  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!login.trim()) nextErrors.login = t("auth.signIn.loginError");
    if (!password) nextErrors.password = t("auth.signIn.passwordError");
    else if (password.length < 6) nextErrors.password = t("auth.signIn.passwordTooShort");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const trimmed = login.trim();
    const isEmail = trimmed.includes("@");

    // No backend behind this form — mimic a short round trip, then sign in locally.
    window.setTimeout(() => {
      signIn({
        ...CURRENT_USER,
        phone: isEmail ? CURRENT_USER.phone : trimmed,
        email: isEmail ? trimmed : undefined,
        registeredAt: CURRENT_USER.registeredAt,
      });
      router.push(localizeHref("/profile"));
    }, 450);
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
          <PhoneOrEmailInput
            id="signin-login"
            value={login}
            onChange={setLogin}
            aria-invalid={!!errors.login}
            className={cn(errors.login && errorInputClass)}
          />
        </AuthField>

        <AuthField label={t("auth.signIn.passwordLabel")} htmlFor="signin-password" error={errors.password}>
          <PasswordInput
            id="signin-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            className={cn(errors.password && errorInputClass)}
          />
        </AuthField>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-muted-foreground">
            <Checkbox checked={remember} onCheckedChange={(checked) => setRemember(checked === true)} />
            {t("auth.signIn.remember")}
          </label>
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
