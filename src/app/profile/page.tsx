import { Clock } from "lucide-react";
import { EmptyState } from "@/components/listings/empty-state";

export default function ProfilePage() {
  return (
    <div className="container flex min-h-[60vh] items-center justify-center py-10">
      <EmptyState
        icon={Clock}
        title="Շուտով հասանելի կլինի"
        description="Անձնական էջը դեռ մշակման փուլում է․ ձեր հայտարարությունները, հավանածները և կարգավորումները կառավարելու հնարավորությունը կհայտնվի շատ շուտով։"
        action={{ label: "Վերադառնալ գլխավոր էջ", href: "/" }}
      />
    </div>
  );
}

/* Temporarily disabled — restore this once the profile page is ready to ship.

"use client";

import * as React from "react";
import Link from "next/link";
import { Archive, Heart, Package, Settings, Star } from "lucide-react";
import { EmptyState } from "@/components/listings/empty-state";
import { ListingGrid } from "@/components/listings/listing-grid";
import { useApp } from "@/components/providers/app-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatMonthYear, plural } from "@/lib/format";
import { getListings, MY_ARCHIVED, MY_LISTINGS } from "@/mock/listings";
import { CURRENT_USER } from "@/mock/sellers";
import { CITIES } from "@/mock/taxonomy";

function SettingsForm() {
  const [name, setName] = React.useState(CURRENT_USER.name);
  const [phone, setPhone] = React.useState(CURRENT_USER.phone);
  const [city, setCity] = React.useState("Կապան");
  const [saved, setSaved] = React.useState(false);
  const [notifications, setNotifications] = React.useState({
    priceDrops: true,
    newsletter: false,
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        setSaved(true);
      }}
      className="max-w-xl space-y-6 rounded-lg border border-border bg-card p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="profile-name" className="mb-1.5 block">
            Անուն
          </Label>
          <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="profile-phone" className="mb-1.5 block">
            Հեռախոս
          </Label>
          <Input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="sm:col-span-2">
          <Label className="mb-1.5 block">Քաղաք</Label>
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger aria-label="Քաղաք">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-5">
        <h3 className="text-sm font-semibold">Ծանուցումներ</h3>
        {[
          { key: "priceDrops" as const, label: "Գնի իջեցում հավանածներում" },
          { key: "newsletter" as const, label: "Հայտարարությունների ընտրանի շաբաթը մեկ" },
        ].map((item) => (
          <label key={item.key} className="flex items-center justify-between gap-4 text-sm">
            {item.label}
            <Switch
              checked={notifications[item.key]}
              onCheckedChange={(checked) =>
                setNotifications((prev) => ({ ...prev, [item.key]: checked }))
              }
            />
          </label>
        ))}
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

export default function ProfilePage() {
  const { favorites, published, hydrated } = useApp();
  const myListings = [...published, ...MY_LISTINGS];
  const favoriteListings = getListings(favorites);

  const stats = [
    { label: "Հայտարարություն", value: myListings.length },
    { label: "Հավանածներում", value: hydrated ? favoriteListings.length : 0 },
    { label: "Արխիվում", value: MY_ARCHIVED.length },
  ];

  return (
    <div className="container py-6 lg:py-8">
      <section className="rounded-lg border border-border bg-card p-5 md:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            <AvatarImage src={CURRENT_USER.avatar} alt={CURRENT_USER.name} />
            <AvatarFallback>{CURRENT_USER.name.slice(0, 1)}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
              {CURRENT_USER.name}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Կայքում՝ {formatMonthYear(CURRENT_USER.registeredAt)}-ից
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px]">
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {CURRENT_USER.rating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                {CURRENT_USER.reviews}{" "}
                {plural(CURRENT_USER.reviews, "կարծիք", "կարծիք")}
              </span>
            </div>
          </div>

          <div className="flex gap-6 sm:gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-xl font-semibold tracking-tight">{stat.value}</p>
                <p className="text-[12px] text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>

          <Button asChild variant="accent" className="sm:self-center">
            <Link href="/create">Հրապարակել հայտարարություն</Link>
          </Button>
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
          <TabsTrigger value="archive" className="gap-2">
            <Archive className="h-4 w-4" />
            Արխիվ
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
          {!hydrated ? (
            <ListingGrid listings={[]} loading skeletonCount={3} columns={3} />
          ) : favoriteListings.length === 0 ? (
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

        <TabsContent value="archive" className="mt-5">
          {MY_ARCHIVED.length === 0 ? (
            <EmptyState icon={Archive} title="Արխիվը դատարկ է" />
          ) : (
            <>
              <p className="mb-4 text-sm text-muted-foreground">
                Հրապարակումից հանված հայտարարություններ։ Դրանք չեն երևում որոնման մեջ։
              </p>
              <ListingGrid listings={MY_ARCHIVED} columns={3} className="opacity-75" />
            </>
          )}
        </TabsContent>

        <TabsContent value="settings" className="mt-5">
          <SettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

*/
