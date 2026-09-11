"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { PasswordInput } from "@/components/auth/password-input";
import { useApp } from "@/components/providers/app-provider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { CURRENT_USER } from "@/mock/sellers";
import { cn } from "@/lib/utils";

interface FormErrors {
  login?: string;
  password?: string;
}

export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useApp();

  const [login, setLogin] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [remember, setRemember] = React.useState(true);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [submitting, setSubmitting] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!login.trim()) nextErrors.login = "Մուտքագրեք հեռախոսահամարը կամ էլ. փոստը";
    if (!password) nextErrors.password = "Մուտքագրեք գաղտնաբառը";
    else if (password.length < 6) nextErrors.password = "Առնվազն 6 նիշ";
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
      router.push("/profile");
    }, 450);
  }

  return (
    <div className="container flex min-h-[calc(100vh-8rem)] items-center justify-center py-10 md:py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Մուտք գործել</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Մուտք գործեք՝ ձեր հայտարարությունները և հավանածները կառավարելու համար
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-card"
        >
          <AuthField label="Հեռախոս կամ էլ. փոստ" htmlFor="signin-login" error={errors.login}>
            <Input
              id="signin-login"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="+374 __ __ __ __"
              autoComplete="username"
              aria-invalid={!!errors.login}
              className={cn(errors.login && errorInputClass)}
            />
          </AuthField>

          <AuthField label="Գաղտնաբառ" htmlFor="signin-password" error={errors.password}>
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
              Հիշել ինձ
            </label>
            <Link href="#" className="text-[13px] font-medium text-accent hover:underline">
              Մոռացե՞լ եք գաղտնաբառը
            </Link>
          </div>

          <Button type="submit" variant="accent" size="lg" className="w-full gap-2" disabled={submitting}>
            <LogIn className="h-4 w-4" />
            {submitting ? "Մուտք..." : "Մուտք գործել"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted-foreground">
          Դեռ հաշիվ չունե՞ք{" "}
          <Link href="/sign-up" className="font-medium text-accent hover:underline">
            Գրանցվել
          </Link>
        </p>
      </div>
    </div>
  );
}
