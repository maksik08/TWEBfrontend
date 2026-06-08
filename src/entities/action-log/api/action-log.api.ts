import { http } from '@/shared/api/http'

export interface ActionLogDto {
  id: number
  actorUserId?: number | null
  actorUserName?: string | null
  actorRole: string
  entityType: string
  entityId?: number | null
  action: string
  details?: string | null
  createdAt: string
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchActionLogs = async (search?: string): Promise<ActionLogDto[]> => {
  const { data } = await http.get<PagedResponse<ActionLogDto>>('/admin/action-logs', {
    params: { pageSize: 100, sortDirection: 'desc', search: search?.trim() || undefined },
  })
  return data.data
}
