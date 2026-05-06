import type {
  ProductDto,
  UpdateProductPayload,
  CreateProductPayload,
} from '@/shared/api/dto/product.dto'
import { http } from '@/shared/api/http'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchProductDtos = async (): Promise<ProductDto[]> => {
  const { data } = await http.get<PagedResponse<ProductDto>>('/products', {
    params: { pageSize: 100, sortBy: 'name', sortDirection: 'asc' },
  })
  return data.data
}

export const updateProductDto = async (
  id: number | string,
  payload: UpdateProductPayload,
): Promise<ProductDto> => {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error('Некорректный id товара')
  }

  const { data } = await http.put<ApiResponse<ProductDto>>(`/products/${numericId}`, payload)
  return data.data
}

export const createProductDto = async (payload: CreateProductPayload): Promise<ProductDto> => {
  const { data } = await http.post<ApiResponse<ProductDto>>('/products', payload)
  return data.data
}

export const deleteProductDto = async (id: number | string): Promise<void> => {
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    throw new Error('Некорректный id товара')
  }
  await http.delete(`/products/${numericId}`)
}
