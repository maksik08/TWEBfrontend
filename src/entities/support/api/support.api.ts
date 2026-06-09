import { http } from '@/shared/api/http'

export type SupportTicketStatus = 'Open' | 'InProgress' | 'Resolved' | 'Closed'

export interface SupportMessageDto {
  id: number
  authorUserId: number
  authorUsername?: string | null
  text: string
  createdAt: string
}

export interface SupportTicketDto {
  id: number
  subject: string
  status: SupportTicketStatus
  customerId: number
  customerUsername?: string | null
  assignedAgentId?: number | null
  assignedAgentUsername?: string | null
  messages: SupportMessageDto[]
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const createSupportTicket = async (payload: { subject: string; message: string }): Promise<SupportTicketDto> => {
  const { data } = await http.post<ApiResponse<SupportTicketDto>>('/support/tickets', payload)
  return data.data
}

export const fetchMySupportTickets = async (): Promise<SupportTicketDto[]> => {
  const { data } = await http.get<PagedResponse<SupportTicketDto>>('/support/tickets/my', {
    params: { pageSize: 50, sortDirection: 'desc' },
  })
  return data.data
}

export const fetchAllSupportTickets = async (): Promise<SupportTicketDto[]> => {
  const { data } = await http.get<PagedResponse<SupportTicketDto>>('/support/tickets', {
    params: { pageSize: 100, sortDirection: 'desc' },
  })
  return data.data
}

export const fetchSupportTicket = async (id: number): Promise<SupportTicketDto> => {
  const { data } = await http.get<ApiResponse<SupportTicketDto>>(`/support/tickets/${id}`)
  return data.data
}

export const postSupportMessage = async (id: number, text: string): Promise<SupportTicketDto> => {
  const { data } = await http.post<ApiResponse<SupportTicketDto>>(`/support/tickets/${id}/messages`, { text })
  return data.data
}

export const updateSupportTicketStatus = async (id: number, status: SupportTicketStatus): Promise<SupportTicketDto> => {
  const { data } = await http.patch<ApiResponse<SupportTicketDto>>(`/support/tickets/${id}/status`, { status })
  return data.data
}

export const assignSupportTicket = async (id: number, agentId: number): Promise<SupportTicketDto> => {
  const { data } = await http.post<ApiResponse<SupportTicketDto>>(`/support/tickets/${id}/assign`, { agentId })
  return data.data
}

export const SUPPORT_STATUS_LABELS: Record<SupportTicketStatus, { ru: string; en: string }> = {
  Open: { ru: 'Открыт', en: 'Open' },
  InProgress: { ru: 'В работе', en: 'In progress' },
  Resolved: { ru: 'Решён', en: 'Resolved' },
  Closed: { ru: 'Закрыт', en: 'Closed' },
}
