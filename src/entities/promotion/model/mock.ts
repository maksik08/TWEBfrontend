import type { Promotion } from './types'

export const promotions: Promotion[] = [
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
