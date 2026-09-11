import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { APP_NAME } from "@/lib/constants";
import { CATEGORIES } from "@/lib/categories";

const COLUMNS = [
  {
    title: "Անշարժ գույք",
    links: CATEGORIES["real-estate"].subcategories.map((s) => ({
      label: s.label,
      href: `/real-estate?subcategory=${s.value}`,
    })),
  },
  {
    title: "Ավտոմեքենաներ",
    links: CATEGORIES.cars.subcategories.map((s) => ({
      label: s.label,
      href: `/cars?subcategory=${s.value}`,
    })),
  },
  {
    title: CATEGORIES.rentals.label,
    links: CATEGORIES.rentals.subcategories.map((s) => ({
      label: s.label,
      href: `/rentals?subcategory=${s.value}`,
    })),
  },
  {
    title: CATEGORIES.hotels.label,
    links: CATEGORIES.hotels.subcategories.map((s) => ({
      label: s.label,
      href: `/hotels?subcategory=${s.value}`,
    })),
  },
  {
    title: CATEGORIES.work.label,
    links: CATEGORIES.work.subcategories.map((s) => ({
      label: s.label,
      href: `/work?subcategory=${s.value}`,
    })),
  },
  {
    title: "Ծառայություններ",
    links: [
      { label: "Հրապարակել հայտարարություն", href: "/create" },
      { label: "Հավանածներ", href: "/favorites" },
      { label: "Պրոֆիլ", href: "/profile" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-[1.1fr_repeat(6,1fr)]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
            Սյունիքի մարզի հայտարարությունների հարթակ. անշարժ գույք, ավտոմեքենաներ և բնակարանների
            վարձակալություն Կապանից ու Գորիսից մինչև Մեղրի. ստուգված վաճառողներ և ճշգրիտ
            բնութագրեր։
          </p>
        </div>
        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h3 className="mb-3 text-sm font-semibold">{column.title}</h3>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border">
        <div className="container flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            © {new Date().getFullYear()} {APP_NAME}. Ցուցադրական նախագիծ, տվյալները գեղարվեստական են։
          </span>
          <span>Կապան, Սյունիքի մարզ</span>
        </div>
      </div>
    </footer>
  );
}
