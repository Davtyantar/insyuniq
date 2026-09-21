"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter } from "next/navigation";
import { Camera, LogOut, Package, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { EmptyState } from "@/components/listings/empty-state";
import { MyListingCard } from "@/components/listings/my-listing-card";
import { useApp, type AuthUser } from "@/components/providers/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { FloatingTabs } from "@/components/ui/floating-tabs";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Skeleton } from "@/components/ui/skeleton";
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
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [saved, setSaved] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t("profile.settings.nameError");
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = t("profile.settings.emailError");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    onSave({ name: name.trim(), phone: phone.trim(), email: email.trim() || undefined });
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

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" variant="accent">
          {t("profile.settings.save")}
        </Button>
        {saved && <span className="text-[13px] text-emerald-600">{t("profile.settings.saved")}</span>}
      </div>
    </form>
  );
}

function ProfileLoading() {
  return (
    <div className="container py-6 lg:py-8">
      <div className="flex items-center gap-5 rounded-lg border border-border bg-card p-5 md:p-6">
        <Skeleton className="h-20 w-20 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
    </div>
  );
}

export function ProfileView() {
  const { t } = useTranslation();
  const router = useRouter();
  const { user, updateUser, signOut, published, hydrated, localizeHref } = useApp();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = React.useState(false);
  const [tab, setTab] = React.useState("listings");

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
    <div className="container py-6 lg:py-8">
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0">
            <Avatar className="h-20 w-20">
              {user.avatar && <AvatarImage src={user.avatar} alt="" />}
              <AvatarFallback className="text-xl">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              aria-label={t("profile.changePhoto")}
              title={t("profile.changePhoto")}
              className="absolute -right-1 -bottom-1 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-sm ring-2 ring-card transition-colors hover:bg-brand-700"
            >
              <Camera className="h-3.5 w-3.5" />
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarChange}
            />
            {avatarError && (
              <p className="absolute top-full mt-1.5 w-max max-w-[160px] text-[11px] leading-snug text-destructive">
                {t("profile.photoError")}
              </p>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{user.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("profile.memberSince", { date: formatMonthYear(user.registeredAt) })}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span>{user.phone}</span>
              {user.email && <span>{user.email}</span>}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Button asChild variant="accent" className="gap-2">
              <Link href="/create">
                <Plus className="h-4 w-4" />
                {t("common.publish")}
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              {t("profile.signOut")}
            </Button>
          </div>
        </div>
      </section>

      <FloatingTabs
        items={[
          { value: "listings", label: t("profile.tabs.listings") },
          { value: "settings", label: t("profile.tabs.settings") },
        ]}
        value={tab}
        onChange={setTab}
        className="mt-6"
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
            </div>
          ))}

        {tab === "settings" && <SettingsForm user={user} onSave={updateUser} />}
      </div>
    </div>
  );
}
