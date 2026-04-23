import type { ProductDto } from '@/shared/api/dto/product.dto'
import { http } from '@/shared/api/http'

export const fetchProductDtos = async (): Promise<ProductDto[]> => {
  const { data } = await http.get<ProductDto[]>('/products')
  return data
}

export const updateProductDto = async (next: ProductDto): Promise<ProductDto> => {
  const id = Number(next.id)
  if (!Number.isFinite(id)) {
    throw new Error('Некорректный id товара')
  }

  const { data } = await http.put<ProductDto>(`/products/${id}`, next)
  return data
}

export const createProductDto = async (next: Omit<ProductDto, 'id'>): Promise<ProductDto> => {
  const { data } = await http.post<ProductDto>('/products', next)
  return data
}

export const deleteProductDto = async (id: number | string): Promise<void> => {
  await http.delete(`/products/${id}`)
}
