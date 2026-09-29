"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter } from "next/navigation";
import { CheckCircle2, CircleAlert, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, authErrorKey, errorInputClass } from "@/components/auth/auth-field";
import { AuthShell } from "@/components/auth/auth-shell";
import { PasswordInput } from "@/components/auth/password-input";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { normalizeArmenianPhone, type AuthErrorCode } from "@/lib/account";
import { cn } from "@/lib/utils";

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignUpView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { signUp, localizeHref } = useApp();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [formError, setFormError] = React.useState<AuthErrorCode | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [sentTo, setSentTo] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) nextErrors.name = t("auth.signUp.nameError");
    if (normalizeArmenianPhone(phone.trim()) === null) nextErrors.phone = t("auth.signUp.phoneError");
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = t("auth.signUp.emailError");
    if (password.length < 6) nextErrors.password = t("auth.signUp.passwordTooShort");
    if (confirmPassword !== password) nextErrors.confirmPassword = t("auth.signUp.passwordMismatch");
    if (!agreed) nextErrors.terms = t("auth.signUp.termsError");
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const result = await signUp({ name, phone, email, password });
    setSubmitting(false);
    if (!result.ok) {
      if (result.error === "invalid-phone") setErrors({ phone: t(authErrorKey(result.error)) });
      else if (result.error === "email-taken") setErrors({ email: t(authErrorKey(result.error)) });
      else if (result.error === "weak-password") setErrors({ password: t(authErrorKey(result.error)) });
      else setFormError(result.error);
      return;
    }
    if (result.needsConfirmation) {
      setSentTo(email.trim());
      return;
    }
    router.push(localizeHref("/profile"));
  }

  return (
    <AuthShell
      title={t("auth.signUp.title")}
      footer={
        <>
          {t("auth.signUp.haveAccount")}{" "}
          <Link href="/sign-in" className="font-medium text-accent hover:underline">
            {t("auth.signUp.signInLink")}
          </Link>
        </>
      }
    >
      {sentTo ? (
        <div key="sent" className="animate-slide-up space-y-4 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-700">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-base font-semibold">{t("auth.signUp.checkEmailTitle")}</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
              {t("auth.signUp.checkEmailDescription", { email: sentTo })}
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <AuthField label={t("auth.signUp.nameLabel")} htmlFor="signup-name" error={errors.name}>
            <Input
              id="signup-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("auth.signUp.namePlaceholder")}
              autoComplete="name"
              aria-invalid={!!errors.name}
              className={cn(errors.name && errorInputClass)}
            />
          </AuthField>

          <AuthField label={t("auth.signUp.phoneLabel")} htmlFor="signup-phone" error={errors.phone}>
            <PhoneInput
              id="signup-phone"
              value={phone}
              onChange={setPhone}
              aria-invalid={!!errors.phone}
              className={cn(errors.phone && errorInputClass)}
            />
          </AuthField>

          <AuthField label={t("auth.signUp.emailLabel")} htmlFor="signup-email" error={errors.email}>
            <Input
              id="signup-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!errors.email}
              className={cn(errors.email && errorInputClass)}
            />
          </AuthField>

          <div className="grid gap-4 sm:grid-cols-2">
            <AuthField label={t("auth.signUp.passwordLabel")} htmlFor="signup-password" error={errors.password}>
              <PasswordInput
                id="signup-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.password}
                className={cn(errors.password && errorInputClass)}
              />
            </AuthField>
            <AuthField
              label={t("auth.signUp.confirmPasswordLabel")}
              htmlFor="signup-confirm"
              error={errors.confirmPassword}
            >
              <PasswordInput
                id="signup-confirm"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                aria-invalid={!!errors.confirmPassword}
                className={cn(errors.confirmPassword && errorInputClass)}
              />
            </AuthField>
          </div>

          <div>
            <label className="flex cursor-pointer items-start gap-2 text-[13px] text-muted-foreground">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
                aria-invalid={!!errors.terms}
              />
              <span>{t("auth.signUp.termsLabel")}</span>
            </label>
            {errors.terms && <p className="mt-1.5 text-[12px] text-destructive">{errors.terms}</p>}
          </div>

          {formError && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
              <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
              {t(authErrorKey(formError))}
            </div>
          )}

          <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitting}>
            <UserPlus className="h-4 w-4" />
            {submitting ? t("auth.signUp.submitting") : t("auth.signUp.submit")}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
