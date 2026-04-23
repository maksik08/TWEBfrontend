import type { Product } from '../model/types'
import type { ProductDto } from '@/shared/api/dto/product.dto'
import { http } from '@/shared/api/http'
import { mapProductDtoToProduct } from '@/entities/product/model/product.mapper'

export const fetchProducts = async (): Promise<Product[]> => {
  const { data } = await http.get<ProductDto[]>('/products')
  return data.map(mapProductDtoToProduct).filter((p) => Number.isFinite(p.id))
}
