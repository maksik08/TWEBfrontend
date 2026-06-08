import { http } from '@/shared/api/http'

export type ReturnStatus = 'Requested' | 'Approved' | 'Rejected'

export interface ReturnDto {
  id: number
  orderId: number
  userId: number
  userName?: string | null
  reason: string
  status: ReturnStatus
  amount: number
  resolution?: string | null
  processedByUserId?: number | null
  resolvedAt?: string | null
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchReturns = async (): Promise<ReturnDto[]> => {
  const { data } = await http.get<PagedResponse<ReturnDto>>('/admin/returns', {
    params: { pageSize: 100, sortDirection: 'desc' },
  })
  return data.data
}

export const createReturn = async (payload: {
  orderId: number
  reason: string
}): Promise<ReturnDto> => {
  const { data } = await http.post<ApiResponse<ReturnDto>>('/admin/returns', payload)
  return data.data
}

export const approveReturn = async (id: number, resolution?: string): Promise<ReturnDto> => {
  const { data } = await http.post<ApiResponse<ReturnDto>>(`/admin/returns/${id}/approve`, {
    resolution,
  })
  return data.data
}

export const rejectReturn = async (id: number, resolution?: string): Promise<ReturnDto> => {
  const { data } = await http.post<ApiResponse<ReturnDto>>(`/admin/returns/${id}/reject`, {
    resolution,
  })
  return data.data
}
