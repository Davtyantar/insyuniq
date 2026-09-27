# InSyuniq

Frontend доски объявлений Сюникской области (Армения): недвижимость и автомобили.
Двери недвижимости (`/real-estate`, `/rentals`, `/hotels`), главная, поиск, избранное и
`/sitemap.xml` читают InSyunik-Api (`NEXT_PUBLIC_API_URL`, по умолчанию
`http://localhost:5080`); автомобили, работа и услуги пока остаются на mock-данных до тех пор,
пока для них не появятся свои API-модули.

## Стек

- Next.js 14 (App Router) + React 18 + TypeScript (strict)
- Tailwind CSS 3, компоненты в стиле shadcn/ui на Radix UI
- Lucide Icons

## Запуск

```bash
npm install
npm run dev              # http://localhost:3000
npm run build            # продакшен-сборка
npm run lint
npm run typecheck
npm test                 # vitest
npm run api:types        # перегенерировать src/lib/api/schema.ts из contract/openapi.yaml
node scripts/smoke-api.mjs   # smoke-тест API-страниц на запущенном dev/prod сервере
```

Контракт (`contract/openapi.yaml`) — копия из InSyunik-Api; его версия закреплена в поле
`contractVersion` файла `package.json`. Обновление:
`git -C ../InSyunik-Api fetch origin && git -C ../InSyunik-Api show origin/main:contract/openapi.yaml > contract/openapi.yaml`,
затем `npm run api:types` и новое значение `contractVersion`. `npm run typecheck` падает, если версии
или сгенерированные типы расходятся.

## Возможности

- Поиск по объявлениям, фильтры недвижимости и автомобилей с состоянием в URL
- Сортировка, переключение сетка/список, пагинация
- Карточка объявления: галерея с полноэкранным режимом, характеристики, карта-заглушка, продавец
- Избранное с сохранением в localStorage
- Мок-мессенджер с диалогами и отправкой сообщений
- Мастер подачи объявления из 7 шагов с drag & drop загрузкой фото
- Профиль: мои объявления, избранное, архив, настройки
- Адаптив: сайдбар-фильтры на десктопе, bottom sheet и нижняя навигация на мобильных

## Структура

```
src/
  app/            маршруты App Router
  components/     UI-примитивы, фильтры, карточки, чат, мастер подачи
  lib/            типы, фильтрация, форматирование, реестр категорий
  mock/           объявления, продавцы, диалоги, справочники
```

Новая категория добавляется записью в `src/lib/categories.ts` и набором полей фильтра —
общая механика списка, карточки и детальной страницы переиспользуется.

## Данные

42 объявления (20 объектов недвижимости и 22 автомобиля) по городам Сюника: Капан, Горис,
Сисиан, Каджаран, Мегри, Агарак, Татев, Хндзореск, Шинуайр. Данные вымышленные,
фотографии — Unsplash.
