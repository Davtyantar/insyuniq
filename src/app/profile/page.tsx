"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, LogOut, Package, Plus, Settings, UserRound } from "lucide-react";
import { AuthField, errorInputClass } from "@/components/auth/auth-field";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { useApp, type AuthUser } from "@/components/providers/app-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMonthYear } from "@/lib/format";
import { getListings } from "@/mock/listings";
import { cn } from "@/lib/utils";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function SettingsForm({ user, onSave }: { user: AuthUser; onSave: (patch: Partial<AuthUser>) => void }) {
  const [name, setName] = React.useState(user.name);
  const [phone, setPhone] = React.useState(user.phone);
  const [email, setEmail] = React.useState(user.email ?? "");
  const [errors, setErrors] = React.useState<{ name?: string; email?: string }>({});
  const [saved, setSaved] = React.useState(false);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const nextErrors: typeof errors = {};
    if (name.trim().length < 2) nextErrors.name = "Մուտքագրեք ձեր անունը";
    if (email.trim() && !EMAIL_PATTERN.test(email.trim())) nextErrors.email = "Մուտքագրեք վավեր էլ. փոստ";
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
        <AuthField label="Անուն" htmlFor="settings-name" error={errors.name}>
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
        <AuthField label="Հեռախոս" htmlFor="settings-phone">
          <Input
            id="settings-phone"
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setSaved(false);
            }}
          />
        </AuthField>
        <AuthField
          label="Էլ. փոստ"
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
          Պահպանել փոփոխությունները
        </Button>
        {saved && <span className="text-[13px] text-emerald-600">Փոփոխությունները պահպանված են</span>}
      </div>
    </form>
  );
}

function SignedOutView() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-10">
      <EmptyState
        icon={UserRound}
        title="Դուք դեռ մուտք չեք գործել"
        description="Մուտք գործեք կամ ստեղծեք հաշիվ՝ ձեր հայտարարությունները հրապարակելու և հավանածները պահպանելու համար։"
        action={{ label: "Մուտք գործել", href: "/sign-in" }}
        secondaryAction={{ label: "Գրանցվել", href: "/sign-up" }}
      />
    </div>
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

export default function ProfilePage() {
  const { user, updateUser, signOut, favorites, published, hydrated } = useApp();

  if (!hydrated) return <ProfileLoading />;
  if (!user) return <SignedOutView />;

  const favoriteListings = getListings(favorites);
  const myListings = published;

  return (
    <div className="container py-6 lg:py-8">
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarFallback className="text-xl">{user.name.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{user.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Կայքում՝ {formatMonthYear(user.registeredAt)}-ից
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-muted-foreground">
              <span>{user.phone}</span>
              {user.email && <span>{user.email}</span>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="accent" className="gap-2">
              <Link href="/create">
                <Plus className="h-4 w-4" />
                Հրապարակել հայտարարություն
              </Link>
            </Button>
            <Button variant="outline" className="gap-2" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              Դուրս գալ
            </Button>
          </div>
        </div>
      </section>

      <Tabs defaultValue="listings" className="mt-6">
        <TabsList>
          <TabsTrigger value="listings" className="gap-2">
            <Package className="h-4 w-4" />
            Իմ հայտարարությունները
          </TabsTrigger>
          <TabsTrigger value="favorites" className="gap-2">
            <Heart className="h-4 w-4" />
            Հավանածներ
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Կարգավորումներ
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="mt-5">
          {myListings.length === 0 ? (
            <EmptyState
              icon={Package}
              title="Դուք դեռ հայտարարություն չունեք"
              description="Տեղադրեք ձեր առաջին հայտարարությունը — դա անվճար է և տևում է մի քանի րոպե։"
              action={{ label: "Հրապարակել հայտարարություն", href: "/create" }}
            />
          ) : (
            <ListingGrid listings={myListings} columns={3} />
          )}
        </TabsContent>

        <TabsContent value="favorites" className="mt-5">
          {favoriteListings.length === 0 ? (
            <EmptyState
              icon={Heart}
              title="Հավանածներում դատարկ է"
              description="Պահպանեք հայտարարությունները, որպեսզի հետո համեմատեք դրանք։"
              action={{ label: "Դիտել հայտարարությունները", href: "/search" }}
            />
          ) : (
            <ListingGrid listings={favoriteListings} columns={3} />
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-5">
          <SettingsForm user={user} onSave={updateUser} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
