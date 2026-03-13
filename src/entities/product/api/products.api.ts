import type { Product } from '../model/types'
import type { ProductDto } from '@/shared/api/dto/product.dto'
import { mapProductDtoToProduct } from '@/entities/product/model/product.mapper'

export const fetchProducts = async (): Promise<Product[]> => {
  // Local "API" endpoint served by Vite from /public/api/products.json
  const response = await fetch('/api/products.json')

  if (!response.ok) {
    throw new Error('Ошибка загрузки товаров')
  }

  const dtos = (await response.json()) as ProductDto[]
  return dtos.map(mapProductDtoToProduct).filter((p) => Number.isFinite(p.id))
}
