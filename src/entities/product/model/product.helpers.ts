import type { Product, ProductAvailability, ProductCategory } from './types'

const categoryLabels: Record<string, string> = {
  router: 'Роутер',
  switch: 'Коммутатор',
  antenna: 'Антенна',
  cable: 'Кабель',
  nas: 'NAS',
  server: 'Серверное оборудование',
}

const availabilityLabels: Record<ProductAvailability, string> = {
  'in-stock': 'В наличии',
  limited: 'Осталось мало',
  preorder: 'Под заказ',
}

export const getProductDisplayName = (product: Product) => product.title || product.name

export const getProductCategoryLabel = (category: ProductCategory) =>
  categoryLabels[category] ?? category

export const getProductAvailabilityLabel = (availability?: ProductAvailability) =>
  availability ? availabilityLabels[availability] : availabilityLabels['in-stock']

export const getProductImageUrl = (product: Product) => {
  if (!product.image || product.image === 'N/A') {
    return undefined
  }

  if (product.image.startsWith('http') || product.image.startsWith('/')) {
    return product.image
  }

  return `/images/product/${product.image}`
}
