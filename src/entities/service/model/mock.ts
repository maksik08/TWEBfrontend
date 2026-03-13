import type { Service } from './types'

export const services: Service[] = [
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
