import type { Product } from '../model/types'
import type { ProductDto } from '@/shared/api/dto/product.dto'
import { http } from '@/shared/api/http'
import { mapProductDtoToProduct } from '@/entities/product/model/product.mapper'

type PagedResponse<T> = {
  success: boolean
  message: string
  data: T[]
}

export const fetchProducts = async (): Promise<Product[]> => {
  const { data: response } = await http.get<PagedResponse<ProductDto>>('/products')
  return response.data.map(mapProductDtoToProduct).filter((p) => Number.isFinite(p.id))
}
