import { http } from '@/shared/api/http'

export type ContactMessageStatus = 'New' | 'InProgress' | 'Resolved'

export interface ContactMessageDto {
  id: number
  name: string
  email: string
  subject: string
  message: string
  userId?: number | null
  userName?: string | null
  isRead: boolean
  status: ContactMessageStatus
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchContactMessages = async (): Promise<ContactMessageDto[]> => {
  const { data } = await http.get<PagedResponse<ContactMessageDto>>('/contact', {
    params: { pageSize: 100, sortDirection: 'desc' },
  })
  return data.data
}

export const updateContactMessageStatus = async (
  id: number,
  status: ContactMessageStatus,
): Promise<ContactMessageDto> => {
  const { data } = await http.patch<ApiResponse<ContactMessageDto>>(`/contact/${id}/status`, {
    status,
  })
  return data.data
}
