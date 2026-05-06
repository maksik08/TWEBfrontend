import type { SupplierDto } from '@/shared/api/dto/supplier.dto'
import { http } from '@/shared/api/http'

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchSupplierDtos = async (): Promise<SupplierDto[]> => {
  const { data } = await http.get<PagedResponse<SupplierDto>>('/suppliers', {
    params: { pageSize: 100, sortBy: 'name', sortDirection: 'asc' },
  })
  return data.data
}
