import type { ProductDto, UpdateProductPayload } from '@/shared/api/dto/product.dto'
import { http } from '@/shared/api/http'

export const fetchProductDtos = async (): Promise<ProductDto[]> => {
  const { data } = await http.get<ProductDto[]>('/products')
  return data
}

export const updateProductDto = async (
  id: number | string,
  payload: UpdateProductPayload,
): Promise<ProductDto> => {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error('Некорректный id товара')
  }

  const { data } = await http.put<ProductDto>(`/products/${numericId}`, payload)
  return data
}

export const createProductDto = async (payload: UpdateProductPayload): Promise<ProductDto> => {
  const { data } = await http.post<ProductDto>('/products', payload)
  return data
}

export const deleteProductDto = async (id: number | string): Promise<void> => {
  await http.delete(`/products/${id}`)
}
