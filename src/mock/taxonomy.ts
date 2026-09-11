import {
  Bike,
  Briefcase,
  Building,
  Car,
  CarFront,
  Construction,
  DoorOpen,
  Factory,
  GraduationCap,
  HardHat,
  Home,
  Hotel,
  House,
  LandPlot,
  Laptop,
  Scissors,
  Shield,
  Store,
  TreePine,
  Truck,
  Utensils,
  Warehouse,
  Wrench,
  Zap,
  type LucideIcon
} from "lucide-react";
import type {
  BodyType,
  CarCondition,
  DealType,
  DriveType,
  EmploymentType,
  ExperienceLevel,
  FuelType,
  RealEstateCondition,
  RentalTerm,
  SellerType,
  Steering,
  Transmission
} from "@/lib/types";

export interface Option<T extends string = string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

/** Towns and larger villages of the Syunik region, north to south. */
export const CITIES: Option[] = [
  { value: "Կապան", label: "Կապան" },
  { value: "Գորիս", label: "Գորիս" },
  { value: "Սիսիան", label: "Սիսիան" },
  { value: "Քաջարան", label: "Քաջարան" },
  { value: "Մեղրի", label: "Մեղրի" },
  { value: "Ագարակ", label: "Ագարակ" },
  { value: "Դաստակերտ", label: "Դաստակերտ" },
  { value: "Տաթև", label: "Տաթև" },
  { value: "Խնձորեսկ", label: "Խնձորեսկ" },
  { value: "Շինուհայր", label: "Շինուհայր" }
];

export const DISTRICTS: Record<string, string[]> = {
  Կապան: [
    "Կենտրոն",
    "Վաչագան",
    "Աճանան",
    "Շահումյան",
    "Ձորք",
    "Կավարտ",
    "Աղբյուր"
  ],
  Գորիս: ["Կենտրոն", "Վերին Գորիս", "Աղբյուր", "Դավիթ Բեկ", "Սյունիք"],
  Սիսիան: ["Կենտրոն", "Արևիկ", "Նորաշեն", "Սիսական"],
  Քաջարան: ["Կենտրոն", "Նորաշեն", "Լեռնային"],
  Մեղրի: ["Կենտրոն", "Պրկաշեն", "Մեծ Թաղ"],
  Ագարակ: ["Կենտրոն", "Գործարանային"],
  Դաստակերտ: ["Կենտրոն"],
  Տաթև: ["Կենտրոն", "Որոտանի կիրճ"],
  Խնձորեսկ: ["Կենտրոն", "Հին Խնձորեսկ"],
  Շինուհայր: ["Կենտրոն"]
};

export const REAL_ESTATE_SUBCATEGORIES: Option[] = [
  { value: "apartments", label: "Բնակարաններ", icon: Building },
  { value: "houses", label: "Տներ", icon: Home },
  { value: "garages", label: "Ավտոտնակներ", icon: Warehouse },
  { value: "new-buildings", label: "Նորակառույցներ", icon: Construction },
  { value: "commercial", label: "Կոմերցիոն անշարժ գույք", icon: Store },
  { value: "land", label: "Հողատարածքներ", icon: LandPlot }
];

export const CAR_SUBCATEGORIES: Option[] = [
  { value: "passenger", label: "Մարդատար մեքենաներ", icon: Car },
  { value: "suv", label: "Ամենագնացներ", icon: CarFront },
  { value: "electric", label: "Էլեկտրական մեքենաներ", icon: Zap },
  { value: "trucks", label: "Բեռնատարներ", icon: Truck },
  { value: "moto", label: "Մոտոտեխնիկա", icon: Bike },
  { value: "parts", label: "Պահեստամասեր", icon: Wrench }
];

export const RENTAL_SUBCATEGORIES: Option[] = [
  {
    value: "apartments",
    label: "Բնակարանների վարձակալություն",
    icon: Building
  },
  { value: "houses", label: "Տների վարձակալություն", icon: Home },
  { value: "commercial", label: "Կոմերցիոն վարձակալություն", icon: Store },
  { value: "garages", label: "Ավտոտնակների վարձակալություն", icon: Warehouse }
];

export const HOTEL_SUBCATEGORIES: Option[] = [
  { value: "hotels", label: "Հյուրանոցներ", icon: Hotel },
  { value: "guesthouses", label: "Հյուրատներ", icon: DoorOpen },
  { value: "houses", label: "Հանգստյան տներ", icon: Home },
  { value: "daily-houses", label: "Օրավարձով առանձնատներ", icon: House },
  { value: "cottages", label: "Կոթեջներ", icon: TreePine }
];

export const WORK_SUBCATEGORIES: Option[] = [
  { value: "sales", label: "Առևտուր և վաճառք", icon: Store },
  { value: "construction", label: "Շինարարություն", icon: HardHat },
  {
    value: "hospitality",
    label: "Հանրային սնունդ և հյուրընկալություն",
    icon: Utensils
  },
  { value: "education", label: "Կրթություն", icon: GraduationCap },
  { value: "driving", label: "Վարորդներ", icon: Truck },
  { value: "it", label: "Տեղեկատվական տեխնոլոգիաներ", icon: Laptop },
  { value: "production", label: "Արտադրություն", icon: Factory },
  { value: "beauty", label: "Գեղեցկություն և խնամք", icon: Scissors },
  { value: "security", label: "Անվտանգություն", icon: Shield },
  { value: "other", label: "Այլ ոլորտներ", icon: Briefcase }
];

export const EMPLOYMENT_TYPES: Option<EmploymentType>[] = [
  { value: "full-time", label: "Լրիվ դրույք" },
  { value: "part-time", label: "Կիսադրույք" },
  { value: "remote", label: "Հեռավար" },
  { value: "internship", label: "Պրակտիկա" }
];

export const EXPERIENCE_LEVELS: Option<ExperienceLevel>[] = [
  { value: "none", label: "Առանց փորձի" },
  { value: "junior", label: "Սկսնակ" },
  { value: "mid", label: "Միջին մակարդակ" },
  { value: "senior", label: "Ավագ մասնագետ" }
];

export const POOL_OPTIONS: Option[] = [
  { value: "yes", label: "Լողավազանով" },
  { value: "no", label: "Առանց լող․" }
];

export const RENTAL_TERMS: Option<RentalTerm>[] = [
  { value: "daily", label: "Օրավարձով" },
  { value: "long", label: "Երկարաժամկետ" }
];

export const DEAL_TYPES: Option<DealType>[] = [
  { value: "sale", label: "Գնել" },
  { value: "rent", label: "Վարձել" }
];

export const ROOMS_OPTIONS: Option[] = [
  { value: "0", label: "Ստուդիո" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" }
];

export const RE_CONDITIONS: Option<RealEstateCondition>[] = [
  { value: "euro", label: "Եվրովերանորոգում" },
  { value: "renovated", label: "Վերանորոգված" },
  { value: "good", label: "Լավ վիճակում" },
  { value: "needs-repair", label: "Կարիք ունի վերանորոգման" },
  { value: "shell", label: "Առանց հարդարման" }
];

export const BUILDING_TYPES: Option[] = [
  { value: "new", label: "Նորակառույց" },
  { value: "secondary", label: "Երկրորդային ֆոնդ" }
];

export const CAR_BRANDS: Record<string, string[]> = {
  Toyota: [
    "Camry",
    "Corolla",
    "RAV4",
    "Land Cruiser Prado",
    "Highlander",
    "C-HR"
  ],
  BMW: ["3 Series", "5 Series", "X3", "X5", "X6", "i4"],
  "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "GLC", "GLE", "EQE"],
  Volkswagen: ["Golf", "Passat", "Tiguan", "Touareg", "Polo", "ID.4"],
  Hyundai: ["Elantra", "Sonata", "Tucson", "Santa Fe", "Ioniq 5", "Creta"],
  Kia: ["Rio", "K5", "Sportage", "Sorento", "EV6", "Seltos"],
  Tesla: ["Model 3", "Model Y", "Model S", "Model X"],
  Lexus: ["ES", "RX", "NX", "LX", "IS"],
  Honda: ["Civic", "Accord", "CR-V", "Pilot", "HR-V"],
  Audi: ["A4", "A6", "Q5", "Q7", "Q8 e-tron", "A3"]
};

export const CAR_BRAND_OPTIONS: Option[] = Object.keys(CAR_BRANDS).map(
  (brand) => ({
    value: brand,
    label: brand
  })
);

export const BODY_TYPES: Option<BodyType>[] = [
  { value: "sedan", label: "Սեդան" },
  { value: "hatchback", label: "Հեչբեկ" },
  { value: "suv", label: "Ամենագնաց" },
  { value: "crossover", label: "Կրոսովեր" },
  { value: "wagon", label: "Ունիվերսալ" },
  { value: "coupe", label: "Կուպե" },
  { value: "minivan", label: "Մինիվեն" },
  { value: "pickup", label: "Պիկապ" },
  { value: "van", label: "Ֆուրգոն" }
];

export const FUEL_TYPES: Option<FuelType>[] = [
  { value: "petrol", label: "Բենզին" },
  { value: "diesel", label: "Դիզել" },
  { value: "hybrid", label: "Հիբրիդ" },
  { value: "electric", label: "Էլեկտրական" },
  { value: "gas", label: "Գազ" }
];

export const TRANSMISSIONS: Option<Transmission>[] = [
  { value: "automatic", label: "Ավտոմատ" },
  { value: "manual", label: "Մեխանիկական" },
  { value: "robot", label: "Ռոբոտացված" },
  { value: "variator", label: "Վարիատոր" }
];

export const DRIVE_TYPES: Option<DriveType>[] = [
  { value: "fwd", label: "Առաջին" },
  { value: "rwd", label: "Հետին" },
  { value: "awd", label: "Լրիվ" }
];

export const CAR_COLORS: Option[] = [
  { value: "Սպիտակ", label: "Սպիտակ" },
  { value: "Սև", label: "Սև" },
  { value: "Մոխրագույն", label: "Մոխրագույն" },
  { value: "Արծաթագույն", label: "Արծաթագույն" },
  { value: "Կապույտ", label: "Կապույտ" },
  { value: "Կարմիր", label: "Կարմիր" },
  { value: "Կանաչ", label: "Կանաչ" },
  { value: "Շագանակագույն", label: "Շագանակագույն" }
];

export const CAR_CONDITIONS: Option<CarCondition>[] = [
  { value: "new", label: "Նոր" },
  { value: "used", label: "Վազքով" }
];

export const STEERING_TYPES: Option<Steering>[] = [
  { value: "left", label: "Ձախ" },
  { value: "right", label: "Աջ" }
];

export const SELLER_TYPES: Record<SellerType, string> = {
  owner: "Սեփականատեր",
  agency: "Անշարժ գույքի գործակալություն",
  dealer: "Ավտոսրահ",
  private: "Ֆիզիկական անձ"
};
