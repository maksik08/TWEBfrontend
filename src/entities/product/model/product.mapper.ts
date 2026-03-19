import type { ProductDto } from '@/shared/api/dto/product.dto'
import type { Product, ProductCategory } from '@/entities/product/model/types'
import { enrichProduct } from '@/entities/product/model/product.details'

const normalizeCategory = (value: string | null | undefined): ProductCategory => {
  const raw = (value ?? '').trim().toLowerCase()

  if (raw === 'routers') return 'router'
  if (raw === 'switches') return 'switch'
  if (raw === 'antennas') return 'antenna'
  if (raw === 'cables') return 'cable'
  if (raw === 'servers') return 'server'

  return (raw || 'router') as ProductCategory
}

const normalizePrice = (value: number | string): number => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const pickImage = (dto: ProductDto): string => {
  if (dto.image) return dto.image
  const first = dto.images?.find(Boolean)
  return (first ?? '') as string
}

export const mapProductDtoToProduct = (dto: ProductDto): Product => {
  const title = (dto.title ?? dto.name ?? '').toString()
  const name = (dto.name ?? dto.title ?? title).toString()

  return enrichProduct({
    id: Number(dto.id),
    title,
    name,
    price: normalizePrice(dto.price),
    category: normalizeCategory(dto.category),
    image: pickImage(dto),
  })
}
