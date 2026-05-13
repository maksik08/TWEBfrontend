import { env } from '@/shared/config/env'
import type { AppLanguage } from '@/shared/i18n'
import type { Product, ProductAvailability, ProductCategory } from './types'

const categoryLabels: Record<string, Record<AppLanguage, string>> = {
  router: { ru: 'Роутер', en: 'Router' },
  switch: { ru: 'Коммутатор', en: 'Switch' },
  antenna: { ru: 'Антенна', en: 'Antenna' },
  cable: { ru: 'Кабель', en: 'Cable' },
  nas: { ru: 'NAS', en: 'NAS' },
  server: { ru: 'Серверное оборудование', en: 'Server equipment' },
}

const availabilityLabels: Record<ProductAvailability, Record<AppLanguage, string>> = {
  'in-stock': { ru: 'В наличии', en: 'In stock' },
  limited: { ru: 'Осталось мало', en: 'Limited stock' },
  preorder: { ru: 'Под заказ', en: 'Pre-order' },
  'out-of-stock': { ru: 'Нет в наличии', en: 'Out of stock' },
}

export const getProductDisplayName = (product: Product) => product.title || product.name

export const getProductCategoryLabel = (category: ProductCategory, language: AppLanguage = 'ru') =>
  categoryLabels[category]?.[language] ?? category

export const getProductAvailabilityLabel = (availability?: ProductAvailability, language: AppLanguage = 'ru') =>
  availability ? availabilityLabels[availability][language] : availabilityLabels['in-stock'][language]

const apiOrigin = (() => {
  try {
    return new URL(env.apiUrl).origin
  } catch {
    return ''
  }
})()

export const resolveImageUrl = (image?: string | null): string | undefined => {
  if (!image || image === 'N/A') return undefined

  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }

  if (image.startsWith('/uploads/') && apiOrigin) {
    return `${apiOrigin}${image}`
  }

  if (image.startsWith('/')) {
    return image
  }

  return `/images/product/${image}`
}

export const getProductImageUrl = (product: Product) => resolveImageUrl(product.image)
