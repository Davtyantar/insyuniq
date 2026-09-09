import {
  Bike,
  Building,
  Car,
  CarFront,
  Construction,
  DoorOpen,
  Home,
  Hotel,
  LandPlot,
  Store,
  TreePine,
  Truck,
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
  { value: "Капан", label: "Капан" },
  { value: "Горис", label: "Горис" },
  { value: "Сисиан", label: "Сисиан" },
  { value: "Каджаран", label: "Каджаран" },
  { value: "Мегри", label: "Мегри" },
  { value: "Агарак", label: "Агарак" },
  { value: "Дастакерт", label: "Дастакерт" },
  { value: "Татев", label: "Татев" },
  { value: "Хндзореск", label: "Хндзореск" },
  { value: "Шинуайр", label: "Шинуайр" }
];

export const DISTRICTS: Record<string, string[]> = {
  Капан: ["Центр", "Вачаган", "Ачанан", "Шахумян", "Дзорк", "Каварт", "Ахбюр"],
  Горис: ["Центр", "Верин Горис", "Ахбюр", "Давид Бек", "Сюник"],
  Сисиан: ["Центр", "Аревик", "Норашен", "Сисакан"],
  Каджаран: ["Центр", "Норашен", "Лернаин"],
  Мегри: ["Центр", "Пркашен", "Мец Тагх"],
  Агарак: ["Центр", "Заводской"],
  Дастакерт: ["Центр"],
  Татев: ["Центр", "Ущелье Воротана"],
  Хндзореск: ["Центр", "Старый Хндзореск"],
  Шинуайр: ["Центр"]
};

export const REAL_ESTATE_SUBCATEGORIES: Option[] = [
  { value: "apartments", label: "Квартиры", icon: Building },
  { value: "houses", label: "Дома", icon: Home },
  { value: "garages", label: "Гаражи", icon: Warehouse },
  { value: "new-buildings", label: "Новостройки", icon: Construction },
  { value: "commercial", label: "Коммерческая недвижимость", icon: Store },
  { value: "land", label: "Земельные участки", icon: LandPlot }
];

export const CAR_SUBCATEGORIES: Option[] = [
  { value: "passenger", label: "Легковые", icon: Car },
  { value: "suv", label: "Внедорожники", icon: CarFront },
  { value: "electric", label: "Электромобили", icon: Zap },
  { value: "trucks", label: "Грузовые", icon: Truck },
  { value: "moto", label: "Мото", icon: Bike },
  { value: "parts", label: "Запчасти", icon: Wrench }
];

export const RENTAL_SUBCATEGORIES: Option[] = [
  { value: "apartments", label: "Аренда квартир", icon: Building },
  { value: "houses", label: "Аренда домов", icon: Home },
  { value: "commercial", label: "Коммерческая аренда", icon: Store },
  { value: "garages", label: "Аренда гаражей", icon: Warehouse }
];

export const HOTEL_SUBCATEGORIES: Option[] = [
  { value: "hotels", label: "Отели", icon: Hotel },
  { value: "guesthouses", label: "Гостевые дома", icon: DoorOpen },
  { value: "houses", label: "Дома отдыха", icon: Home },
  { value: "cottages", label: "Коттеджи", icon: TreePine }
];

export const RENTAL_TERMS: Option<RentalTerm>[] = [
  { value: "daily", label: "Посуточно" },
  { value: "long", label: "Длительный срок" }
];

export const DEAL_TYPES: Option<DealType>[] = [
  { value: "sale", label: "Купить" },
  { value: "rent", label: "Снять" }
];

export const ROOMS_OPTIONS: Option[] = [
  { value: "0", label: "Студия" },
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "3", label: "3" },
  { value: "4", label: "4" },
  { value: "5", label: "5+" }
];

export const RE_CONDITIONS: Option<RealEstateCondition>[] = [
  { value: "euro", label: "Евроремонт" },
  { value: "renovated", label: "После ремонта" },
  { value: "good", label: "Хорошее" },
  { value: "needs-repair", label: "Требует ремонта" },
  { value: "shell", label: "Без отделки" }
];

export const BUILDING_TYPES: Option[] = [
  { value: "new", label: "Новостройка" },
  { value: "secondary", label: "Вторичка" }
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
  { value: "sedan", label: "Седан" },
  { value: "hatchback", label: "Хэтчбек" },
  { value: "suv", label: "Внедорожник" },
  { value: "crossover", label: "Кроссовер" },
  { value: "wagon", label: "Универсал" },
  { value: "coupe", label: "Купе" },
  { value: "minivan", label: "Минивэн" },
  { value: "pickup", label: "Пикап" },
  { value: "van", label: "Фургон" }
];

export const FUEL_TYPES: Option<FuelType>[] = [
  { value: "petrol", label: "Бензин" },
  { value: "diesel", label: "Дизель" },
  { value: "hybrid", label: "Гибрид" },
  { value: "electric", label: "Электро" },
  { value: "gas", label: "Газ" }
];

export const TRANSMISSIONS: Option<Transmission>[] = [
  { value: "automatic", label: "Автомат" },
  { value: "manual", label: "Механика" },
  { value: "robot", label: "Робот" },
  { value: "variator", label: "Вариатор" }
];

export const DRIVE_TYPES: Option<DriveType>[] = [
  { value: "fwd", label: "Передний" },
  { value: "rwd", label: "Задний" },
  { value: "awd", label: "Полный" }
];

export const CAR_COLORS: Option[] = [
  { value: "Белый", label: "Белый" },
  { value: "Чёрный", label: "Чёрный" },
  { value: "Серый", label: "Серый" },
  { value: "Серебристый", label: "Серебристый" },
  { value: "Синий", label: "Синий" },
  { value: "Красный", label: "Красный" },
  { value: "Зелёный", label: "Зелёный" },
  { value: "Коричневый", label: "Коричневый" }
];

export const CAR_CONDITIONS: Option<CarCondition>[] = [
  { value: "new", label: "Новый" },
  { value: "used", label: "С пробегом" }
];

export const STEERING_TYPES: Option<Steering>[] = [
  { value: "left", label: "Левый" },
  { value: "right", label: "Правый" }
];

export const SELLER_TYPES: Record<SellerType, string> = {
  owner: "Собственник",
  agency: "Агентство недвижимости",
  dealer: "Автосалон",
  private: "Частное лицо"
};
