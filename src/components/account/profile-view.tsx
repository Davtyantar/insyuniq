"use client";

import * as React from "react";
import { Link } from "@/components/i18n/locale-link";
import { useRouter, useSearchParams } from "next/navigation";
import { Camera, ChevronRight, CircleAlert, ImageIcon, KeyRound, Package, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AuthField, authErrorKey, errorInputClass } from "@/components/auth/auth-field";
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
import { createApi } from "@/lib/api/client";
import { getMyListings } from "@/lib/api/me";
import { isUploadableImage, uploadImage } from "@/lib/api/media";
import type { ListingStatus } from "@/lib/api/types";
import { normalizeArmenianPhone, type AuthErrorCode } from "@/lib/account";
import { catalogCard, legacyCard, type CardModel } from "@/lib/card";
import { MOCK_DOORS } from "@/lib/categories";
import { formatMonthYear } from "@/lib/format";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SettingsForm({ user }: { user: AuthUser }) {
  const { t } = useTranslation();
  const { saveProfile, changeEmail, changePassword } = useApp();
  const [name, setName] = React.useState(user.name);
  const [phone, setPhone] = React.useState(user.phone);
  const [email, setEmail] = React.useState(user.email ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<{
    name?: string;
    phone?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [formError, setFormError] = React.useState<AuthErrorCode | null>(null);
  const [emailPending, setEmailPending] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = t("profile.settings.nameError");
    if (!normalizeArmenianPhone(phone)) nextErrors.phone = t("auth.errors.invalidPhone");
    if (!EMAIL_PATTERN.test(email.trim())) nextErrors.email = t("profile.settings.emailError");
    // The password block is optional — only validated once any of its fields is touched.
    const changingPassword = !!(currentPassword || newPassword || confirmPassword);
    if (changingPassword) {
      if (!currentPassword) nextErrors.currentPassword = t("profile.settings.currentPasswordError");
      if (newPassword.length < 6) nextErrors.newPassword = t("auth.signUp.passwordTooShort");
      if (confirmPassword !== newPassword) nextErrors.confirmPassword = t("auth.signUp.passwordMismatch");
    }
    setErrors(nextErrors);
    setFormError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    const saved = await saveProfile({ name, phone });
    if (!saved.ok) {
      setSubmitting(false);
      setFormError(saved.error);
      return;
    }
    if (email.trim() !== (user.email ?? "")) {
      const changed = await changeEmail(email);
      if (!changed.ok) setErrors((prev) => ({ ...prev, email: t(authErrorKey(changed.error)) }));
      else setEmailPending(true);
    }
    if (changingPassword) {
      const changed = await changePassword(currentPassword, newPassword);
      if (!changed.ok) {
        setErrors((prev) => ({
          ...prev,
          currentPassword:
            changed.error === "invalid-credentials" ? t("profile.settings.currentPasswordError") : undefined,
          newPassword: changed.error === "invalid-credentials" ? undefined : t(authErrorKey(changed.error)),
        }));
      } else {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    }
    setSubmitting(false);
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
        <AuthField label={t("profile.settings.phoneLabel")} htmlFor="settings-phone" error={errors.phone}>
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
              setEmailPending(false);
            }}
            placeholder="you@example.com"
            className={cn(errors.email && errorInputClass)}
          />
          {emailPending && (
            <p className="mt-1.5 text-[12px] text-muted-foreground">{t("profile.settings.emailPending")}</p>
          )}
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

      {formError && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-[13px] text-destructive">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          {t(authErrorKey(formError))}
        </div>
      )}

      <div className="flex items-center gap-3 border-t border-border pt-5">
        <Button type="submit" variant="accent" disabled={submitting}>
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
  const { user, profile, profileLoading, getToken, published, deleteListing, hydrated, localizeHref, createHref, saveProfile } =
    useApp();
  const avatarInputRef = React.useRef<HTMLInputElement>(null);
  const [avatarError, setAvatarError] = React.useState(false);
  const [apiListings, setApiListings] = React.useState<{ card: CardModel; status: ListingStatus }[] | null>(null);
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

  const userEmail = user?.email;
  React.useEffect(() => {
    if (!userEmail) return;
    let cancelled = false;
    (async () => {
      const token = await getToken();
      if (!token) return [];
      const page = await getMyListings(createApi({ token }), { pageSize: 100 });
      return page.items.flatMap((item) => {
        const card = catalogCard(item);
        return card ? [{ card, status: item.status }] : [];
      });
    })()
      .then((items) => {
        if (!cancelled) setApiListings(items);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          console.warn("Could not load my listings", error);
          setApiListings([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [userEmail, getToken]);

  const localListings = published.filter((listing) => MOCK_DOORS.includes(listing.category));

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isUploadableImage(file)) {
      setAvatarError(true);
      return;
    }
    setAvatarError(false);
    const token = await getToken();
    if (!token) return;
    try {
      const avatarPath = await uploadImage(createApi({ token }), file, "avatar");
      const result = await saveProfile({ avatarPath });
      if (!result.ok) setAvatarError(true);
    } catch (error) {
      console.warn("Avatar upload failed", error);
      setAvatarError(true);
    }
  }

  if (!hydrated || !user) return <ProfileLoading />;

  return (
    <div className="container py-4 lg:py-6">
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-[13px] text-foreground/70"
      >
        {/* On phones the crumb is capped at two levels — "Home" drops off. */}
        <span className="hidden sm:contents">
          <Link href="/" className="transition-colors hover:text-foreground">
            {t("common.home")}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
        </span>
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
          (apiListings === null ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="aspect-[4/5] w-full rounded-lg" />
              ))}
            </div>
          ) : apiListings.length === 0 && localListings.length === 0 ? (
            <EmptyState
              icon={Package}
              title={t("profile.emptyListings.title")}
              description={t("profile.emptyListings.description")}
              action={{ label: t("profile.emptyListings.action"), href: "/create" }}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {apiListings.map(({ card, status }, index) => (
                <MyListingCard key={card.id} card={card} status={status} priority={index < 4} />
              ))}
              {localListings.map((listing, index) => (
                <MyListingCard
                  key={listing.id}
                  card={legacyCard(listing)}
                  editHref={`/create?edit=${listing.id}`}
                  onDelete={() => deleteListing(listing.id)}
                  priority={apiListings.length + index < 4}
                />
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

        {tab === "settings" &&
          (profileLoading ? (
            <ProfileLoading />
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="order-2 min-w-0 flex-1 sm:order-1 sm:max-w-xl [&>form]:h-full">
                <SettingsForm key={profile?.id ?? "no-profile"} user={user} />
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
                    className="group relative rounded-full ring-2 ring-accent ring-offset-2 ring-offset-card focus:outline-none"
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
                        void saveProfile({ avatarPath: null });
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
          ))}
      </div>
    </div>
  );
}
