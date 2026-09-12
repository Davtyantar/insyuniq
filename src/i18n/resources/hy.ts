/** Armenian — canonical shape. ru.ts and en.ts are type-checked against this via `satisfies`. */
export const hy = {
  common: {
    home: "Գլխավոր",
    search: "Որոնում",
    publish: "Հրապարակել",
    favorites: "Հավանածներ",
    profile: "Պրոֆիլ",
    signIn: "Մուտք",
    viewAll: "Տեսնել բոլորը",
    publishListing: "Հրապարակել հայտարարություն",
    allListings: "Բոլոր հայտարարությունները",
    languageAndCurrency: "Լեզու և արժույթ",
    acrossTheRegion: "Ողջ մարզում",
    previous: "Նախորդները",
    next: "Հաջորդները",
    allSections: "Բոլոր բաժինները",
    sections: "Բաժիններ",
    selectCity: "Ընտրել քաղաքը",
    lightTheme: "Լուսավոր թեմա",
    darkTheme: "Մուգ թեմա",
    switchToLightTheme: "Միացնել լուսավոր թեման",
    switchToDarkTheme: "Միացնել մուգ թեման",
  },
  footer: {
    description:
      "Սյունիքի մարզի հայտարարությունների հարթակ. անշարժ գույք, ավտոմեքենաներ և բնակարանների վարձակալություն Կապանից ու Գորիսից մինչև Մեղրի. ստուգված վաճառողներ և ճշգրիտ բնութագրեր։",
    servicesTitle: "Ծառայություններ",
    publishListing: "Հրապարակել հայտարարություն",
    copyright: "© {{year}} {{appName}}. Ցուցադրական նախագիծ, տվյալները գեղարվեստական են։",
    location: "Կապան, Սյունիքի մարզ",
  },
  search: {
    placeholder: "Որոնել հայտարարությունների մեջ",
    recent: "Վերջին որոնումները",
    popular: "Հանրաճանաչ բաժիններ",
    clear: "Մաքրել ցանկը",
    noResults: 'Ոչինչ չի գտնվել «{{query}}» հարցման համար',
    allResultsFor: 'Բոլոր արդյունքները «{{query}}» հարցման համար',
  },
  home: {
    promo: {
      heading: "Անվճար հայտարարությունների տախտակ",
      headingHighlight: "Սյունիքի մարզի",
      text: "Անշարժ գույք, տրանսպորտ, վարձակալություն և կացություն՝ հեշտ ու արագ մեկ հարթակում։ Ձեր բոլոր կարիքները՝ մեկ հարթակում։",
      viewListings: "Դիտել հայտարարությունները",
      work: "Աշխատանք",
    },
    banners: {
      apartments: {
        title: "Փնտրում եք",
        highlight: "բնակարան",
        text: "Փնտրո՞ւմ եք բնակարան։ Նոր և հին կառույցների բնակարաններ՝ վաճառքով և վարձով, ողջ Սյունիքում",
        cta: "Դիտել բնակարանները",
      },
      guesthouses: {
        title: "Հանգստի եք",
        highlight: "գնում",
        text: "Հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձով, հարմարավետ պայմաններով և ստուգված առաջարկներով ողջ Սյունիքում։",
        cta: "Դիտել հյուրատները",
      },
    },
    hits: {
      realEstate: {
        title: "Անշարժ գույքի հիթեր",
        subtitle: "Ամենադիտված բնակարանները, տները և նորակառույցները",
      },
      cars: {
        title: "Ավտոմեքենաների հիթեր",
        subtitle: "Ամենադիտված մարդատար և էլեկտրական մեքենաները",
      },
      rentals: {
        title: "Վարձակալության հիթեր",
        subtitle: "Բնակարաններ, տներ, ավտոտնակներ և կոմերցիոն գույք վարձով",
      },
      hotels: {
        title: "Հյուրանոցների և հանգստի հիթեր",
        subtitle: "Հյուրանոցներ, հյուրատներ և հանգստյան բնակատեղեր՝ օրավարձ և ժամկետով",
      },
      dailyHouses: {
        title: "Օրավարձով առանձնատներ",
        subtitle: "Ամբողջական առանձնատներ մեկ օրով՝ ընկերական և ընտանեկան հավաքույթների համար",
      },
    },
    benefits: {
      verified: {
        title: "Ստուգված հայտարարություններ",
        text: "Փաստաթղթերի և հասցեի ստուգում մինչև հրապարակումը.",
      },
      fast: {
        title: "Արագ հրապարակում",
        text: "Հայտարարությունը հրապարակվում է մի քանի րոպեում՝ յոթ քայլով.",
      },
      call: {
        title: "Ուղիղ զանգ վաճառողին",
        text: "Հեռախոսահամարը բացվում է մեկ սեղմումով, առանց միջնորդների.",
      },
      safe: {
        title: "Անվտանգ գործարք",
        text: "Խորհուրդներ և պատմության ստուգում յուրաքանչյուր կատեգորիայում.",
      },
    },
    cta: {
      heading: "Տեղադրեք Ձեր հայտարարությունը",
      headingFree: "անվճար",
      text: "Տեղադրեք հայտարարությունը անվճար՝ ցանկացած կատեգորիայում — անշարժ գույք, ավտոմեքենա, հյուրատուն կամ հյուրանոց. ավելացրեք լուսանկարներ, բնութագրեր և ստացեք առաջին արձագանքները դեռ այսօր",
      button: "Հրապարակել հայտարարություն",
    },
  },
  auth: {
    signIn: {
      title: "Մուտք գործել",
      subtitle: "Մուտք գործեք՝ ձեր հայտարարությունները և հավանածները կառավարելու համար",
      loginLabel: "Հեռախոս կամ էլ. փոստ",
      loginPlaceholder: "+374 __ __ __ __",
      loginError: "Մուտքագրեք հեռախոսահամարը կամ էլ. փոստը",
      passwordLabel: "Գաղտնաբառ",
      passwordError: "Մուտքագրեք գաղտնաբառը",
      passwordTooShort: "Առնվազն 6 նիշ",
      remember: "Հիշել ինձ",
      forgotPassword: "Մոռացե՞լ եք գաղտնաբառը",
      submit: "Մուտք գործել",
      submitting: "Մուտք...",
      noAccount: "Դեռ հաշիվ չունե՞ք",
      signUpLink: "Գրանցվել",
    },
    signUp: {
      title: "Գրանցում",
      subtitle: "Ստեղծեք հաշիվ՝ հայտարարություններ հրապարակելու և հավանածները պահպանելու համար",
      nameLabel: "Անուն Ազգանուն",
      namePlaceholder: "Օր․ Անի Հակոբյան",
      nameError: "Մուտքագրեք ձեր անունը",
      phoneLabel: "Հեռախոս",
      phonePlaceholder: "+374 __ __ __ __",
      phoneError: "Մուտքագրեք վավեր հեռախոսահամար",
      emailLabel: "Էլ. փոստ",
      emailOptional: "Ոչ պարտադիր",
      emailError: "Մուտքագրեք վավեր էլ. փոստ",
      passwordLabel: "Գաղտնաբառ",
      passwordTooShort: "Առնվազն 6 նիշ",
      confirmPasswordLabel: "Կրկնել գաղտնաբառը",
      passwordMismatch: "Գաղտնաբառերը չեն համընկնում",
      termsLabel: "Համաձայն եմ Օգտագործման կանոնների և Գաղտնիության քաղաքականության հետ",
      termsError: "Անհրաժեշտ է համաձայնվել կանոնների հետ",
      submit: "Գրանցվել",
      submitting: "Գրանցում...",
      haveAccount: "Արդեն ունե՞ք հաշիվ",
      signInLink: "Մուտք գործել",
    },
  },
  profile: {
    memberSince: "Կայքում՝ {{date}}-ից",
    signOut: "Դուրս գալ",
    signedOut: {
      title: "Դուք դեռ մուտք չեք գործել",
      description:
        "Մուտք գործեք կամ ստեղծեք հաշիվ՝ ձեր հայտարարությունները հրապարակելու և հավանածները պահպանելու համար։",
      signIn: "Մուտք գործել",
      signUp: "Գրանցվել",
    },
    tabs: {
      listings: "Իմ հայտարարությունները",
      favorites: "Հավանածներ",
      settings: "Կարգավորումներ",
    },
    emptyListings: {
      title: "Դուք դեռ հայտարարություն չունեք",
      description: "Տեղադրեք ձեր առաջին հայտարարությունը — դա անվճար է և տևում է մի քանի րոպե։",
      action: "Հրապարակել հայտարարություն",
    },
    emptyFavorites: {
      title: "Հավանածներում դատարկ է",
      description: "Պահպանեք հայտարարությունները, որպեսզի հետո համեմատեք դրանք։",
      action: "Դիտել հայտարարությունները",
    },
    settings: {
      nameLabel: "Անուն",
      nameError: "Մուտքագրեք ձեր անունը",
      phoneLabel: "Հեռախոս",
      emailLabel: "Էլ. փոստ",
      emailError: "Մուտքագրեք վավեր էլ. փոստ",
      save: "Պահպանել փոփոխությունները",
      saved: "Փոփոխությունները պահպանված են",
    },
  },
  favorites: {
    loading: "Բեռնում ենք պահպանված հայտարարությունները…",
    count_one: "{{count}} հայտարարություն պահպանված",
    count_other: "{{count}} հայտարարություններ պահպանված",
    tabs: {
      all: "Բոլորը",
      realEstate: "Անշարժ գույք",
      cars: "Ավտոմեքենաներ",
      rentals: "Վարձակալություն",
      hotels: "Հյուրանոցներ և հանգիստ",
    },
    emptyAll: {
      title: "Հավանածներում դեռ դատարկ է",
      description:
        "Սեղմեք սրտիկի վրա հայտարարության քարտում, որպեսզի հետո վերադառնաք դրան ցանկացած սարքից։",
      action: "Դիտել անշարժ գույքը",
      secondaryAction: "Դիտել ավտոմեքենաները",
    },
    emptyCategory: {
      title: "Այս կատեգորիայում դատարկ է",
    },
  },
  /** Keyed by the slug in src/lib/cities.ts — "name" is the plain city name, "in" is the locative ("in <city>") form. */
  cities: {
    kapan: { name: "Կապան", in: "Կապանում" },
    goris: { name: "Գորիս", in: "Գորիսում" },
    sisian: { name: "Սիսիան", in: "Սիսիանում" },
    kajaran: { name: "Քաջարան", in: "Քաջարանում" },
    meghri: { name: "Մեղրի", in: "Մեղրիում" },
    agarak: { name: "Ագարակ", in: "Ագարակում" },
    dastakert: { name: "Դաստակերտ", in: "Դաստակերտում" },
    tatev: { name: "Տաթև", in: "Տաթևում" },
    khndzoresk: { name: "Խնձորեսկ", in: "Խնձորեսկում" },
    shinuhayr: { name: "Շինուհայր", in: "Շինուհայրում" },
  },
} as const;

/** Same nested key shape as `hy`, but every leaf widened to `string` — what ru.ts/en.ts must satisfy. */
export type Messages = { [K in keyof typeof hy]: DeepStringify<(typeof hy)[K]> };
type DeepStringify<T> = T extends string ? string : { [K in keyof T]: DeepStringify<T[K]> };
