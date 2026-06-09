import { http } from '@/shared/api/http'

export type ServiceRequestStatus =
  | 'Submitted'
  | 'Accepted'
  | 'Assigned'
  | 'InProgress'
  | 'Completed'
  | 'Cancelled'

export interface ServiceTariffDto {
  id: number
  name: string
  description?: string | null
  price: number
  isActive: boolean
  createdAt: string
}

export interface ServiceRequestDto {
  id: number
  requestNumber: string
  serviceTariffId?: number | null
  serviceTitle: string
  description?: string | null
  address: string
  contactPhone: string
  price: number
  paidAt?: string | null
  preferredVisitAt?: string | null
  scheduledVisitAt?: string | null
  status: ServiceRequestStatus
  completionReport?: string | null
  completedAt?: string | null
  rating?: number | null
  ratingComment?: string | null
  ratedAt?: string | null
  installerUsername?: string | null
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

// ─── Tariffs ──────────────────────────────────────────────────────────────────

export const fetchServiceTariffs = async (includeInactive = false): Promise<ServiceTariffDto[]> => {
  const { data } = await http.get<ApiResponse<ServiceTariffDto[]>>('/servicetariffs', {
    params: { includeInactive },
  })
  return data.data
}

export interface ServiceTariffPayload {
  name: string
  description?: string | null
  price: number
  isActive: boolean
}

export const createServiceTariff = async (payload: ServiceTariffPayload): Promise<ServiceTariffDto> => {
  const { data } = await http.post<ApiResponse<ServiceTariffDto>>('/servicetariffs', payload)
  return data.data
}

export const updateServiceTariff = async (id: number, payload: ServiceTariffPayload): Promise<ServiceTariffDto> => {
  const { data } = await http.put<ApiResponse<ServiceTariffDto>>(`/servicetariffs/${id}`, payload)
  return data.data
}

export const deleteServiceTariff = async (id: number): Promise<void> => {
  await http.delete(`/servicetariffs/${id}`)
}

// ─── Service requests (client) ───────────────────────────────────────────────

export const fetchMyServiceRequests = async (): Promise<ServiceRequestDto[]> => {
  const { data } = await http.get<PagedResponse<ServiceRequestDto>>('/servicerequests/my', {
    params: { pageSize: 50, sortBy: 'createdAt', sortDirection: 'desc' },
  })
  return data.data
}

export interface CreateServiceRequestPayload {
  serviceTariffId: number
  description?: string
  address: string
  contactPhone: string
  preferredVisitAt?: string | null
}

export const createServiceRequest = async (payload: CreateServiceRequestPayload): Promise<ServiceRequestDto> => {
  const { data } = await http.post<ApiResponse<ServiceRequestDto>>('/servicerequests', payload)
  return data.data
}

export const payServiceRequest = async (id: number): Promise<ServiceRequestDto> => {
  const { data } = await http.post<ApiResponse<ServiceRequestDto>>(`/servicerequests/${id}/pay`)
  return data.data
}

export const rateServiceRequest = async (
  id: number,
  rating: number,
  comment?: string,
): Promise<ServiceRequestDto> => {
  const { data } = await http.post<ApiResponse<ServiceRequestDto>>(`/servicerequests/${id}/rate`, {
    rating,
    comment,
  })
  return data.data
}
