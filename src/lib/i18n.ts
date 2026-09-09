export type Locale = "ru" | "am" | "en";

export const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: "ru", label: "Русский" },
  { value: "am", label: "Հայերեն" },
  { value: "en", label: "English" },
];

/** Keyed by the Russian source string used throughout the app's mock data. */
const DICTIONARY: Record<string, Record<Locale, string>> = {
  "Недвижимость": { ru: "Недвижимость", am: "Անշարժ գույք", en: "Real estate" },
  "Автомобили": { ru: "Автомобили", am: "Ավտոմեքենաներ", en: "Cars" },
  "Квартиры": { ru: "Квартиры", am: "Բնակարաններ", en: "Apartments" },
  "Дома": { ru: "Дома", am: "Տներ", en: "Houses" },
  "Комнаты": { ru: "Комнаты", am: "Սենյակներ", en: "Rooms" },
  "Новостройки": { ru: "Новостройки", am: "Նորակառույցներ", en: "New buildings" },
  "Коммерческая недвижимость": {
    ru: "Коммерческая недвижимость",
    am: "Կոմերցիոն գույք",
    en: "Commercial property",
  },
  "Земельные участки": { ru: "Земельные участки", am: "Հողատարածքներ", en: "Land plots" },
  "Легковые": { ru: "Легковые", am: "Մարդատար մեքենաներ", en: "Passenger cars" },
  "Внедорожники": { ru: "Внедорожники", am: "Ամենագնացներ", en: "SUVs" },
  "Электромобили": { ru: "Электромобили", am: "Էլեկտրական մեքենաներ", en: "Electric cars" },
  "Грузовые": { ru: "Грузовые", am: "Բեռնատարներ", en: "Trucks" },
  "Мото": { ru: "Мото", am: "Մոտոտեխնիկա", en: "Motorcycles" },
  "Запчасти": { ru: "Запчасти", am: "Պահեստամասեր", en: "Spare parts" },
  "Все объявления": { ru: "Все объявления", am: "Բոլոր հայտարարությունները", en: "All listings" },
  "Избранное": { ru: "Избранное", am: "Հավանածներ", en: "Favorites" },
  "Войти": { ru: "Войти", am: "Մուտք", en: "Sign in" },
  "Подать объявление": {
    ru: "Подать объявление",
    am: "Հրապարակել հայտարարություն",
    en: "Post a listing",
  },
  "Выбрать город": { ru: "Выбрать город", am: "Ընտրել քաղաքը", en: "Choose city" },
  "Поиск по объявлениям": {
    ru: "Поиск по объявлениям",
    am: "Որոնել հայտարարությունների մեջ",
    en: "Search listings",
  },
};

/** Only the header and hero copy is localized so far — everything else stays in Russian. */
export function translate(text: string, locale: Locale): string {
  if (locale === "ru") return text;
  return DICTIONARY[text]?.[locale] ?? text;
}
