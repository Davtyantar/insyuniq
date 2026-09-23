"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, ChevronRight, ImageIcon, KeyRound, Package, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { PasswordInput } from "@/components/auth/password-input";
import { EmptyState } from "@/components/listings/empty-state";
import { MyListingCard } from "@/components/listings/my-listing-card";
import { useApp, type AuthUser } from "@/components/providers/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FloatingTabs } from "@/components/ui/floating-tabs";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
import { getDemoPassword, setDemoPassword } from "@/lib/demo-password";
import { formatMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Avatars are stored as data URLs in the user record (itself persisted to localStorage), unlike
 * listing photos — those live only for the session, so an object URL is fine for them, but an
 * avatar needs to still be there after a reload, which only a data URL (not a blob: URL) survives. */
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function SettingsForm({ user, onSave }: { user: AuthUser; onSave: (patch: Partial<AuthUser>) => void }) {
  const { t } = useTranslation();
  const [name, setName] = React.useState(user.name);
  const [phone, setPhone] = React.useState(user.phone);
  const [email, setEmail] = React.useState(user.email ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{
    name?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [saved, setSaved] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t("profile.settings.nameError");
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = t("profile.settings.emailError");
    // The password block is optional — only validated once any of its fields is touched.
    const changingPassword = !!(currentPassword || newPassword || confirmPassword);
    if (changingPassword) {
      if (currentPassword !== getDemoPassword()) nextErrors.currentPassword = t("profile.settings.currentPasswordError");
      if (newPassword.length < 6) nextErrors.newPassword = t("auth.signUp.passwordTooShort");
      if (confirmPassword !== newPassword) nextErrors.confirmPassword = t("auth.signUp.passwordMismatch");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined });
    if (changingPassword) {
      setDemoPassword(newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setSaved(true);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="max-w-xl space-y-4 rounded-lg border border-border bg-card p-5 md:p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <AuthField label={t("profile.settings.nameLabel")} htmlFor="settings-name" error={errors.name}>
          <Input
            id="settings-name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setSaved(false);
            }}
            className={cn(errors.name && errorInputClass)}
          />
        </AuthField>
        <AuthField label={t("profile.settings.phoneLabel")} htmlFor="settings-phone">
          <PhoneInput
            id="settings-phone"
            value={phone}
            onChange={(value) => {
              setPhone(value);
              setSaved(false);
            }}
          />
        </AuthField>
        <AuthField
          label={t("profile.settings.emailLabel")}
          htmlFor="settings-email"
          error={errors.email}
          className="sm:col-span-2"
        >
          <Input
            id="settings-email"
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSaved(false);
            }}
            placeholder="you@example.com"
            className={cn(errors.email && errorInputClass)}
          />
        </AuthField>
      </div>

      <div className="space-y-4 border-t border-border pt-5">
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">{t("profile.settings.passwordTitle")}</h2>
        </div>
        <AuthField
          label={t("profile.settings.currentPasswordLabel")}
          htmlFor="settings-current-password"
          error={errors.currentPassword}
        >
          <PasswordInput
            id="settings-current-password"
            value={currentPassword}
            onChange={(event) => {
              setCurrentPassword(event.target.value);
              setSaved(false);
            }}
            autoComplete="current-password"
            aria-invalid={!!errors.currentPassword}
            className={cn(errors.currentPassword && errorInputClass)}
          />
        </AuthField>
        <div className="grid gap-4 sm:grid-cols-2">
          <AuthField
            label={t("profile.settings.newPasswordLabel")}
            htmlFor="settings-new-password"
            error={errors.newPassword}
          >
            <PasswordInput
              id="settings-new-password"
              value={newPassword}
              onChange={(event) => {
                setNewPassword(event.target.value);
                setSaved(false);
              }}
              autoComplete="new-password"
              aria-invalid={!!errors.newPassword}
              className={cn(errors.newPassword && errorInputClass)}
            />
          </AuthField>
          <AuthField
            label={t("auth.signUp.confirmPasswordLabel")}
            htmlFor="settings-confirm-password"
            error={errors.confirmPassword}
          >
            <PasswordInput
              id="settings-confirm-password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                setSaved(false);
              }}
              autoComplete="new-password"
              aria-invalid={!!errors.confirmPassword}
              className={cn(errors.confirmPassword && errorInputClass)}
            />
          </AuthField>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" variant="accent">
          {t("profile.settings.save")}
        </Button>
        {saved && <span className="text-[13px] text-emerald-600">{t("profile.settings.saved")}</span>}
      </div>
    </form>
  );
}

export function ProfileLoading() {
  return (
    <div className="container py-6 lg:py-8">
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[4/5] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function ProfileView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateUser, published, hydrated, localizeHref, createHref } = useApp();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = React.useState(false);
  // The tab lives in the URL so the header's account menu can link straight to "Settings".
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "settings" ? "settings" : "listings";
  const setTab = (next: string) =>
    router.replace(localizeHref(next === "settings" ? "/profile?tab=settings" : "/profile"), { scroll: false });

  // No bare "you're signed out" page — send people straight to the (now much nicer) sign-in
  // form instead. It already lands back on /profile once they've signed in.
  React.useEffect(() => {
    if (hydrated && !user) router.replace(localizeHref("/sign-in"));
  }, [hydrated, user, router, localizeHref]);

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > MAX_AVATAR_BYTES) {
      setAvatarError(true);
      return;
    }
    setAvatarError(false);
    // Applied immediately on pick — a photo change doesn't need the settings tab's separate
    // "Save" step the way name/phone/email do.
    updateUser({ avatar: await readAsDataUrl(file) });
  }

  if (!hydrated || !user) return <ProfileLoading />;

  const myListings = published;

  return (
    <div className="container py-4 lg:py-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-foreground/70"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          {t("common.home")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/profile" className="transition-colors hover:text-foreground">
          {t("common.profile")}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span aria-current="page" className="font-medium text-foreground">
          {t(tab === "settings" ? "profile.tabs.settings" : "profile.tabs.listings")}
        </span>
      </nav>

      <FloatingTabs
        items={[
          { value: "listings", label: t("profile.tabs.listings") },
          { value: "settings", label: t("profile.tabs.settings") },
        ]}
        value={tab}
        onChange={setTab}
      />

      <div className="mt-5">
        {tab === "listings" &&
          (myListings.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("profile.emptyListings.title")}
              description={t("profile.emptyListings.description")}
              action={{ label: t("profile.emptyListings.action"), href: "/create" }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {myListings.map((listing, index) => (
                <MyListingCard key={listing.id} listing={listing} priority={index < 4} />
              ))}
              <Link
                href={createHref}
                className="group flex min-h-[240px] flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-card/50 p-4 text-center text-muted-foreground transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform duration-200 group-hover:scale-110">
                  <Plus className="h-6 w-6" />
                </span>
                <span className="text-sm font-medium">{t("profile.emptyListings.action")}</span>
              </Link>
            </div>
          ))}

        {tab === "settings" && (
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="order-2 min-w-0 flex-1 sm:order-1 sm:max-w-xl [&>form]:h-full">
              <SettingsForm user={user} onSave={updateUser} />
            </div>

            <div className="order-1 flex flex-col rounded-lg border border-border bg-card p-5 sm:order-2 sm:w-72 md:p-6">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold">{t("profile.settings.photoTitle")}</h2>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  aria-label={t("profile.changePhoto")}
                  title={t("profile.changePhoto")}
                  className="group relative rounded-full ring-4 ring-accent/15 ring-offset-2 ring-offset-card transition-shadow hover:ring-accent/40 focus:outline-none focus-visible:ring-accent"
                >
                  <Avatar className="h-32 w-32">
                    {user.avatar && <AvatarImage src={user.avatar} alt="" className="object-cover" />}
                    <AvatarFallback className="text-4xl font-semibold">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  {/* Hover veil so the whole photo reads as the upload target, not just a corner badge. */}
                  <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Camera className="h-7 w-7" />
                  </span>
                </button>
                <p className="mt-4 max-w-full truncate text-base font-semibold">{user.name}</p>
                <p className="mt-0.5 text-[13px] text-muted-foreground">
                  {t("profile.memberSince", { date: formatMonthYear(user.registeredAt) })}
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-5">
                <Button variant="outline" className="w-full gap-2" onClick={() => avatarInputRef.current?.click()}>
                  <Camera className="h-4 w-4" />
                  {t("profile.changePhoto")}
                </Button>
                {user.avatar && (
                  <Button
                    variant="ghost"
                    className="w-full gap-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => {
                      setAvatarError(false);
                      updateUser({ avatar: undefined });
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    {t("profile.settings.removePhoto")}
                  </Button>
                )}
                <p
                  className={cn(
                    "pt-1 text-center text-[12px] leading-snug",
                    avatarError ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {avatarError ? t("profile.photoError") : t("profile.settings.photoHint")}
                </p>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
