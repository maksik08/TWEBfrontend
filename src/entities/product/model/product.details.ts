import type { Product } from './types'

const buildDefaultSku = (product: Product) =>
  `NT-${product.category.toUpperCase()}-${String(product.id).padStart(4, '0')}`

const buildDefaultDescription = (product: Product) =>
  `${product.title} подходит для сетевых инсталляций, где важны стабильность, удобство эксплуатации и понятные технические характеристики.`

const buildDefaultShortDescription = (product: Product) =>
  `${product.title} для задач категории "${product.category}".`

export const enrichProduct = (product: Product): Product => ({
  ...product,
  brand: product.brand ?? 'NetInstall',
  sku: product.sku ?? buildDefaultSku(product),
  shortDescription: product.shortDescription ?? buildDefaultShortDescription(product),
  description: product.description ?? buildDefaultDescription(product),
  availability: product.availability ?? 'in-stock',
  technology: product.technology ?? [],
  keyFeatures: product.keyFeatures ?? [],
  specifications: product.specifications ?? [],
  packageContents: product.packageContents ?? [],
  warranty: product.warranty ?? '12 месяцев',
})
