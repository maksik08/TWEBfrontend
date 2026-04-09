import type { ProductDto } from '@/shared/api/dto/product.dto'
import { productsOverride } from '@/entities/product/api/products.override'

export const fetchProductDtos = async (): Promise<ProductDto[]> => {
  const override = productsOverride.get()
  if (override) return override

  const response = await fetch('/api/products.json')
  if (!response.ok) {
    throw new Error('Ошибка загрузки товаров')
  }

  return (await response.json()) as ProductDto[]
}

const normalizeId = (value: number | string) => Number(value)

export const updateProductDto = async (next: ProductDto): Promise<ProductDto[]> => {
  const base = await fetchProductDtos()
  const nextId = normalizeId(next.id)

  if (!Number.isFinite(nextId)) {
    throw new Error('Некорректный id товара')
  }

  const updated = base.map((dto) => (normalizeId(dto.id) === nextId ? { ...dto, ...next, id: dto.id } : dto))
  productsOverride.set(updated)
  return updated
}

export const clearProductsOverride = () => {
  productsOverride.clear()
}

