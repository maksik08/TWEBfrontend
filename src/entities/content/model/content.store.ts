import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Types ───────────────────────────────────────────────────────────────────

export type BilingualText = { ru: string; en: string }

export type ContentPromo = {
  id: number
  badge: BilingualText
  badgeColor: string
  title: BilingualText
  desc: BilingualText
  discount: string
  gradient: string
}

export type ContentBenefit = {
  icon: string
  title: BilingualText
  text: BilingualText
}

export type ContentCategory = {
  icon: string
  name: BilingualText
  count: BilingualText
}

export type ContentCta = {
  title: BilingualText
  text: BilingualText
}

export type ContentValue = {
  icon: string
  title: BilingualText
  text: BilingualText
}

export type ContentTimelineItem = {
  year: string
  text: BilingualText
}

export type ContentService = {
  id: string
  name: string
  description: string
  price: number
  ctaLabel: string
}

export type ContentPromotion = {
  id: string
  title: string
  description: string
  badge: string
  discountLabel: string
}

export type HomeContent = {
  promos: ContentPromo[]
  benefits: ContentBenefit[]
  categories: ContentCategory[]
  cta: ContentCta
}

export type AboutContent = {
  lead: BilingualText
  values: ContentValue[]
  timeline: ContentTimelineItem[]
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const defaultServices: ContentService[] = [
  {
    id: 'site-survey',
    name: 'Аудит и обследование объекта',
    price: 80,
    description: 'Проверяем покрытие, узкие места и готовим схему монтажа под ваш объект.',
    ctaLabel: 'Рассчитать аудит',
  },
  {
    id: 'installation',
    name: 'Монтаж и пусконаладка',
    price: 150,
    description: 'Подключаем оборудование, маркируем линии и запускаем сеть в работу.',
    ctaLabel: 'Рассчитать монтаж',
  },
  {
    id: 'support',
    name: 'Сервисное сопровождение',
    price: 60,
    description: 'Берём на себя обслуживание, обновления и оперативные выезды инженеров.',
    ctaLabel: 'Подобрать план',
  },
]

export const defaultPromotions: ContentPromotion[] = [
  {
    id: 'promo-office',
    title: 'Офис под ключ',
    description: 'При заказе монтажа и настройки офиса даём скидку на выезд и первичную схему.',
    badge: 'Для офиса',
    discountLabel: '-15% на запуск',
  },
  {
    id: 'promo-wifi',
    title: 'Wi-Fi upgrade',
    description: 'Собираем обновление беспроводной сети с бонусом на настройку гостевого доступа.',
    badge: 'Беспроводная сеть',
    discountLabel: '-10% на настройку',
  },
  {
    id: 'promo-support',
    title: 'Поддержка 24/7',
    description: 'Подключаем сопровождение после монтажа со скидкой на первый месяц сервиса.',
    badge: 'Поддержка',
    discountLabel: '1 месяц со скидкой',
  },
]

export const defaultHome: HomeContent = {
  promos: [
    {
      id: 1,
      badge: { ru: 'Хит продаж', en: 'Best seller' },
      badgeColor: 'danger',
      title: { ru: 'Скидка 20% на коммутаторы', en: '20% off switches' },
      desc: { ru: 'Управляемые и неуправляемые коммутаторы Cisco, TP-Link, D-Link по специальной цене до конца месяца.', en: 'Managed and unmanaged Cisco, TP-Link, D-Link switches at a special price until end of month.' },
      discount: '−20%',
      gradient: 'gradientDanger',
    },
    {
      id: 2,
      badge: { ru: 'Новинки', en: 'New' },
      badgeColor: 'success',
      title: { ru: 'Wi-Fi 6E роутеры', en: 'Wi-Fi 6E routers' },
      desc: { ru: 'Новое поколение беспроводного оборудования. Трёхдиапазонные маршрутизаторы с поддержкой 6 ГГц.', en: 'Next generation wireless equipment. Tri-band routers with 6 GHz support.' },
      discount: '−15%',
      gradient: 'gradientSuccess',
    },
    {
      id: 3,
      badge: { ru: 'Ограничено', en: 'Limited' },
      badgeColor: 'warning',
      title: { ru: 'Серверное оборудование', en: 'Server equipment' },
      desc: { ru: 'Стоечные серверы и системы хранения данных. Остаток на складе — только 12 единиц.', en: 'Rack servers and storage systems. Only 12 units left in stock.' },
      discount: '−10%',
      gradient: 'gradientWarm',
    },
  ],
  benefits: [
    {
      icon: '🚚',
      title: { ru: 'Быстрая доставка', en: 'Fast delivery' },
      text: { ru: 'Отправка со склада в день заказа. Доставка по всей Молдове от 1 рабочего дня.', en: 'Ships from stock on the day of order. Delivery across Moldova from 1 business day.' },
    },
    {
      icon: '✅',
      title: { ru: 'Гарантия 3 года', en: '3-year warranty' },
      text: { ru: 'Официальная гарантия на всё оборудование от производителя.', en: 'Official manufacturer warranty on all equipment.' },
    },
    {
      icon: '🛠️',
      title: { ru: 'Монтаж и настройка', en: 'Installation & setup' },
      text: { ru: 'Выезд специалистов для установки и конфигурации оборудования.', en: 'Specialist visit for equipment installation and configuration.' },
    },
    {
      icon: '💬',
      title: { ru: 'Тех. поддержка 24/7', en: 'Tech support 24/7' },
      text: { ru: 'Консультации по подбору и поддержка после покупки.', en: 'Selection advice and post-purchase support.' },
    },
  ],
  categories: [
    { icon: '🔀', name: { ru: 'Коммутаторы', en: 'Switches' }, count: { ru: '120+ моделей', en: '120+ models' } },
    { icon: '📡', name: { ru: 'Точки доступа', en: 'Access points' }, count: { ru: '80+ моделей', en: '80+ models' } },
    { icon: '🌐', name: { ru: 'Маршрутизаторы', en: 'Routers' }, count: { ru: '95+ моделей', en: '95+ models' } },
    { icon: '🔒', name: { ru: 'Файрволы', en: 'Firewalls' }, count: { ru: '40+ моделей', en: '40+ models' } },
    { icon: '💾', name: { ru: 'СХД', en: 'Storage' }, count: { ru: '35+ моделей', en: '35+ models' } },
    { icon: '📦', name: { ru: 'Кабели и патч-панели', en: 'Cables & patch panels' }, count: { ru: '200+ позиций', en: '200+ items' } },
  ],
  cta: {
    title: { ru: 'Готовы начать проект?', en: 'Ready to start a project?' },
    text: { ru: 'Воспользуйтесь калькулятором стоимости или сразу переходите в каталог — соберите нужное оборудование в корзину и оформите заказ.', en: 'Use the cost calculator or go straight to the catalog — add the equipment you need to your cart and place an order.' },
  },
}

export const defaultAbout: AboutContent = {
  lead: {
    ru: 'NetInstall — молдавский интернет-магазин и системный интегратор в области сетевого оборудования. Мы работаем с 2015 года и помогаем бизнесу по всей Молдове строить надёжную IT-инфраструктуру: от небольшого офиса до распределённой корпоративной сети.',
    en: 'NetInstall is a Moldovan online store and system integrator in the field of network equipment. We have been working since 2015, helping businesses across Moldova build reliable IT infrastructure: from small offices to distributed corporate networks.',
  },
  values: [
    {
      icon: '🎯',
      title: { ru: 'Экспертиза', en: 'Expertise' },
      text: { ru: 'Мы консультируем по подбору оборудования, а не просто продаём. Каждый специалист имеет профильные сертификаты.', en: 'We advise on equipment selection, not just sell. Every specialist holds relevant certifications.' },
    },
    {
      icon: '🔍',
      title: { ru: 'Прозрачность', en: 'Transparency' },
      text: { ru: 'Показываем товар, доставку и услуги отдельными частями, чтобы итог формирования заказа был понятен.', en: 'We show goods, delivery, and services as separate line items so the order total is clear.' },
    },
    {
      icon: '⚡',
      title: { ru: 'Скорость', en: 'Speed' },
      text: { ru: 'Склад в Кишинёве — отправка в день заказа. Доставка по всей Молдове от 1 рабочего дня.', en: 'Warehouse in Chisinau — ships on the day of order. Delivery across Moldova from 1 business day.' },
    },
    {
      icon: '🤝',
      title: { ru: 'Партнёрство', en: 'Partnership' },
      text: { ru: 'Официальные партнёры Cisco, TP-Link, MikroTik, Ubiquiti, HPE. Прямые поставки без посредников.', en: 'Official partners of Cisco, TP-Link, MikroTik, Ubiquiti, HPE. Direct supplies without intermediaries.' },
    },
  ],
  timeline: [
    { year: '2015', text: { ru: 'Основание компании, первые поставки Cisco и TP-Link', en: 'Company founded, first Cisco and TP-Link deliveries' } },
    { year: '2018', text: { ru: 'Запуск отдела монтажа и технического обслуживания', en: 'Launch of installation and technical maintenance department' } },
    { year: '2021', text: { ru: 'Открытие партнёрства с HPE и Ubiquiti', en: 'Partnership established with HPE and Ubiquiti' } },
    { year: '2024', text: { ru: 'Запуск обновлённой платформы с онлайн-калькулятором', en: 'Launch of updated platform with online calculator' } },
  ],
}

// ─── Store ────────────────────────────────────────────────────────────────────

type ContentState = {
  services: ContentService[]
  promotions: ContentPromotion[]
  home: HomeContent
  about: AboutContent
  setServices: (v: ContentService[]) => void
  setPromotions: (v: ContentPromotion[]) => void
  setHome: (v: HomeContent) => void
  setAbout: (v: AboutContent) => void
  resetToDefaults: () => void
}

export const useContentStore = create<ContentState>()(
  persist(
    (set) => ({
      services: defaultServices,
      promotions: defaultPromotions,
      home: defaultHome,
      about: defaultAbout,

      setServices: (services) => set({ services }),
      setPromotions: (promotions) => set({ promotions }),
      setHome: (home) => set({ home }),
      setAbout: (about) => set({ about }),
      resetToDefaults: () =>
        set({
          services: defaultServices,
          promotions: defaultPromotions,
          home: defaultHome,
          about: defaultAbout,
        }),
    }),
    {
      name: 'netinstall-content',
      version: 1,
    },
  ),
)
