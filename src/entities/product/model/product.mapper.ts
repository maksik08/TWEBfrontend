import type { ProductDto, ProductSpecificationDto } from '@/shared/api/dto/product.dto'
import type { Product, ProductAvailability, ProductCategory, ProductSpecification } from '@/entities/product/model/types'
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

const generateUpdatedAt = (id: number): string => {
  const date = new Date(2024, 0, 1)
  date.setDate(date.getDate() + id * 17)
  return date.toISOString()
}

const pickImage = (dto: ProductDto): string => {
  if (dto.image) return dto.image
  const first = dto.images?.find(Boolean)
  return (first ?? '') as string
}

const VALID_AVAILABILITIES: ProductAvailability[] = ['in-stock', 'limited', 'preorder', 'out-of-stock']

const normalizeAvailability = (value: string | null | undefined): ProductAvailability | undefined => {
  if (!value) return undefined
  const raw = value.trim().toLowerCase()
  return (VALID_AVAILABILITIES as string[]).includes(raw) ? (raw as ProductAvailability) : undefined
}

const trimOrUndefined = (value: string | null | undefined): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

const compactStringList = (values: Array<string | null> | null | undefined): string[] | undefined => {
  if (!Array.isArray(values)) return undefined
  const cleaned = values
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0)
    .map((entry) => entry.trim())
  return cleaned.length > 0 ? cleaned : undefined
}

const compactSpecifications = (
  values: Array<ProductSpecificationDto | null> | null | undefined,
): ProductSpecification[] | undefined => {
  if (!Array.isArray(values)) return undefined
  const cleaned = values
    .filter((entry): entry is ProductSpecificationDto =>
      entry !== null && typeof entry.label === 'string' && typeof entry.value === 'string'
        && entry.label.trim().length > 0 && entry.value.trim().length > 0,
    )
    .map((entry) => ({ label: entry.label.trim(), value: entry.value.trim() }))
  return cleaned.length > 0 ? cleaned : undefined
}

export const mapProductDtoToProduct = (dto: ProductDto): Product => {
  const title = (dto.title ?? dto.name ?? '').toString()
  const name = (dto.name ?? dto.title ?? title).toString()

  const id = Number(dto.id)
  const stockQuantity = typeof dto.stockQuantity === 'number' ? dto.stockQuantity : undefined
  const isPreorder = typeof dto.isPreorder === 'boolean' ? dto.isPreorder : undefined
  const availability = normalizeAvailability(dto.availability)

  return enrichProduct({
    id,
    title,
    name,
    price: normalizePrice(dto.price),
    category: normalizeCategory(dto.category),
    image: pickImage(dto),
    stockQuantity,
    isPreorder,
    availability,
    brand: trimOrUndefined(dto.brand),
    sku: trimOrUndefined(dto.sku),
    shortDescription: trimOrUndefined(dto.shortDescription),
    description: trimOrUndefined(dto.description),
    warranty: trimOrUndefined(dto.warranty),
    technology: compactStringList(dto.technology),
    keyFeatures: compactStringList(dto.keyFeatures),
    packageContents: compactStringList(dto.packageContents),
    specifications: compactSpecifications(dto.specifications),
    ratingAverage: typeof dto.ratingAverage === 'number' ? dto.ratingAverage : undefined,
    ratingCount: typeof dto.ratingCount === 'number' ? dto.ratingCount : undefined,
    updatedAt: generateUpdatedAt(id),
  })
}
