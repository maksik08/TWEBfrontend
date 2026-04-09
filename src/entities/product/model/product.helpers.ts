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
}

export const getProductDisplayName = (product: Product) => product.title || product.name

export const getProductCategoryLabel = (category: ProductCategory, language: AppLanguage = 'ru') =>
  categoryLabels[category]?.[language] ?? category

export const getProductAvailabilityLabel = (availability?: ProductAvailability, language: AppLanguage = 'ru') =>
  availability ? availabilityLabels[availability][language] : availabilityLabels['in-stock'][language]

export const getProductImageUrl = (product: Product) => {
  if (!product.image || product.image === 'N/A') {
    return undefined
  }

  if (product.image.startsWith('http') || product.image.startsWith('/')) {
    return product.image
  }

  return `/images/product/${product.image}`
}
