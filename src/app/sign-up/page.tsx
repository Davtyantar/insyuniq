"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UserPlus } from "lucide-react";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { PasswordInput } from "@/components/auth/password-input";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
}

const PHONE_PATTERN = /^[+\d][\d\s-]{6,}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useApp();

  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [agreed, setAgreed] = React.useState(false);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) nextErrors.name = "Մուտքագրեք ձեր անունը";
    if (!PHONE_PATTERN.test(phone.trim())) nextErrors.phone = "Մուտքագրեք վավեր հեռախոսահամար";
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Մուտքագրեք վավեր էլ. փոստ";
    if (password.length < 6) nextErrors.password = "Առնվազն 6 նիշ";
    if (confirmPassword !== password) nextErrors.confirmPassword = "Գաղտնաբառերը չեն համընկնում";
    if (!agreed) nextErrors.terms = "Անհրաժեշտ է համաձայնվել կանոնների հետ";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    // No backend behind this form — mimic a short round trip, then create the account locally.
    window.setTimeout(() => {
      signUp({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        registeredAt: new Date().toISOString(),
      });
      router.push("/profile");
    }, 450);
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Գրանցում</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Ստեղծեք հաշիվ՝ հայտարարություններ հրապարակելու և հավանածները պահպանելու համար
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-card"
        >
          <AuthField label="Անուն Ազգանուն" htmlFor="signup-name" error={errors.name}>
            <Input
              id="signup-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Օր․ Անի Հակոբյան"
              autoComplete="name"
              aria-invalid={!!errors.name}
              className={cn(errors.name && errorInputClass)}
            />
          </AuthField>

          <AuthField label="Հեռախոս" htmlFor="signup-phone" error={errors.phone}>
            <Input
              id="signup-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+374 __ __ __ __"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={!!errors.phone}
              className={cn(errors.phone && errorInputClass)}
            />
          </AuthField>

          <AuthField
            label="Էլ. փոստ"
            htmlFor="signup-email"
            error={errors.email}
            hint={!errors.email ? "Ոչ պարտադիր" : undefined}
          >
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
            <AuthField label="Գաղտնաբառ" htmlFor="signup-password" error={errors.password}>
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
            <AuthField label="Կրկնել գաղտնաբառը" htmlFor="signup-confirm" error={errors.confirmPassword}>
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
              <span>Համաձայն եմ Օգտագործման կանոնների և Գաղտնիության քաղաքականության հետ</span>
            </label>
            {errors.terms && <p className="mt-1.5 text-[12px] text-destructive">{errors.terms}</p>}
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitting}>
            <UserPlus className="h-4 w-4" />
            {submitting ? "Գրանցում..." : "Գրանցվել"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Արդեն ունե՞ք հաշիվ{" "}
          <Link href="/sign-in" className="font-medium text-accent hover:underline">
            Մուտք գործել
          </Link>
        </p>
      </div>
    </div>
  );
}
