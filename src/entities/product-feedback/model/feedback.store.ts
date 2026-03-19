import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ProductReview = {
  id: string
  productId: number
  author: string
  rating: number
  comment: string
  createdAt: string
}

type ProductFeedbackState = {
  reviews: Record<string, ProductReview[]>
  addReview: (payload: {
    productId: number
    author: string
    rating: number
    comment: string
  }) => void
}

const clampRating = (value: number) => Math.max(0, Math.min(5, Math.round(value)))

const createReview = (
  id: string,
  productId: number,
  author: string,
  rating: number,
  comment: string,
  createdAt: string,
): ProductReview => ({
  id,
  productId,
  author,
  rating: clampRating(rating),
  comment,
  createdAt,
})

const seededReviews: Record<string, ProductReview[]> = {
  '1': [
    createReview(
      'seed-1-1',
      1,
      'Максим',
      5,
      'Поставил в двухкомнатную квартиру, сигнал стабильный даже через две стены. Настройка заняла около десяти минут.',
      '2026-02-11T11:15:00.000Z',
    ),
    createReview(
      'seed-1-2',
      1,
      'Ольга',
      4,
      'Хороший роутер для дома: LAN-порты гигабитные, IPTV поднялся без проблем. Интерфейс понятный.',
      '2026-02-26T09:30:00.000Z',
    ),
  ],
  '2': [
    createReview(
      'seed-2-1',
      2,
      'Игорь',
      4,
      'Использую для IP-камер и рабочих станций. Порты не режут скорость, корпус почти не греется.',
      '2026-01-29T16:45:00.000Z',
    ),
  ],
  '3': [
    createReview(
      'seed-3-1',
      3,
      'Дмитрий',
      5,
      'На складе помогла вытянуть сигнал там, где обычная антенна не справлялась. Крепёж в комплекте нормальный.',
      '2026-02-06T13:20:00.000Z',
    ),
  ],
  '4': [
    createReview(
      'seed-4-1',
      4,
      'Анна',
      4,
      'Кабель мягкий, коннекторы сидят плотно, для домашнего NAS и роутера подошёл отлично.',
      '2026-03-01T08:10:00.000Z',
    ),
  ],
  '5': [
    createReview(
      'seed-5-1',
      5,
      'Сергей',
      5,
      'Хороший вариант для резервных копий и семейного архива. Интерфейс понятный, сетевые папки поднимаются быстро.',
      '2026-02-18T18:05:00.000Z',
    ),
    createReview(
      'seed-5-2',
      5,
      'Марина',
      4,
      'Для маленькой команды зашёл хорошо. Хотелось бы чуть тише вентилятор, но по функциям всё устраивает.',
      '2026-03-04T12:00:00.000Z',
    ),
  ],
  '6': [
    createReview(
      'seed-6-1',
      6,
      'Александр',
      4,
      'Нормальный стойковый модуль, металл плотный, геометрия ровная. Под монтаж в серверной подошёл.',
      '2026-02-03T10:55:00.000Z',
    ),
  ],
  '7': [
    createReview(
      'seed-7-1',
      7,
      'Павел',
      5,
      'AX6000 закрывает весь дом и двор. Под нагрузкой с NAS и TV держится уверенно.',
      '2026-03-08T14:40:00.000Z',
    ),
  ],
  '8': [
    createReview(
      'seed-8-1',
      8,
      'Елена',
      5,
      'Mesh реально убрал мёртвые зоны на втором этаже. Переключение между узлами незаметное.',
      '2026-02-22T17:25:00.000Z',
    ),
  ],
  '9': [
    createReview(
      'seed-9-1',
      9,
      'Roman',
      4,
      'Удобно брать в поездки. Поднял отдельную сеть в гостинице и подключил рабочий ноутбук через VPN.',
      '2026-03-10T07:50:00.000Z',
    ),
  ],
  '10': [
    createReview(
      'seed-10-1',
      10,
      'Nikita',
      5,
      'Брал для небольшого офиса с удалённым доступом. WireGuard настроился быстро, VLAN тоже работают как нужно.',
      '2026-03-12T15:10:00.000Z',
    ),
  ],
}

export const useProductFeedbackStore = create<ProductFeedbackState>()(
  persist(
    (set) => ({
      reviews: seededReviews,
      addReview: ({ productId, author, rating, comment }) =>
        set((state) => {
          const key = String(productId)
          const nextReview = createReview(
            `${Date.now()}-${Math.round(Math.random() * 1000)}`,
            productId,
            author.trim() || 'Гость',
            rating,
            comment.trim(),
            new Date().toISOString(),
          )

          return {
            reviews: {
              ...state.reviews,
              [key]: [nextReview, ...(state.reviews[key] ?? [])],
            },
          }
        }),
    }),
    {
      name: 'product-feedback',
      version: 1,
    },
  ),
)

export const getProductRatingSummary = (reviews: ProductReview[]) => {
  if (reviews.length === 0) {
    return {
      average: 0,
      total: 0,
    }
  }

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)

  return {
    average: Number((totalRating / reviews.length).toFixed(1)),
    total: reviews.length,
  }
}
