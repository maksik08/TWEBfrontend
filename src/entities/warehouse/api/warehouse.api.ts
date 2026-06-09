import { http } from '@/shared/api/http'

export interface WarehouseSyncLine {
  productId: number
  sku: string
  productName: string
  previousQuantity: number
  newQuantity: number
}

export interface WarehouseSyncResult {
  applied: boolean
  totalProducts: number
  withoutSku: number
  notInWarehouse: number
  updated: number
  unchanged: number
  syncedAt: string
  changes: WarehouseSyncLine[]
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const previewWarehouseSync = async (): Promise<WarehouseSyncResult> => {
  const { data } = await http.get<ApiResponse<WarehouseSyncResult>>('/admin/warehouse/preview')
  return data.data
}

export const syncWarehouse = async (): Promise<WarehouseSyncResult> => {
  const { data } = await http.post<ApiResponse<WarehouseSyncResult>>('/admin/warehouse/sync')
  return data.data
}
