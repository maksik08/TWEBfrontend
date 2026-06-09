import { http } from '@/shared/api/http'

export type DiscountType = 'Percentage' | 'Fixed'

export interface CouponDto {
  id: number
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxUses?: number | null
  usedCount: number
  expiresAt?: string | null
  isActive: boolean
  createdAt: string
}

export interface CouponPreviewResult {
  code: string
  discountType: DiscountType
  discountValue: number
  discount: number
}

export interface CouponPayload {
  code: string
  discountType: DiscountType
  discountValue: number
  minOrderAmount: number
  maxUses?: number | null
  expiresAt?: string | null
  isActive: boolean
}

interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export const fetchCoupons = async (): Promise<CouponDto[]> => {
  const { data } = await http.get<PagedResponse<CouponDto>>('/coupons', {
    params: { pageSize: 100, sortDirection: 'desc' },
  })
  return data.data
}

export const createCoupon = async (payload: CouponPayload): Promise<CouponDto> => {
  const { data } = await http.post<ApiResponse<CouponDto>>('/coupons', payload)
  return data.data
}

export const updateCoupon = async (id: number, payload: CouponPayload): Promise<CouponDto> => {
  const { data } = await http.put<ApiResponse<CouponDto>>(`/coupons/${id}`, payload)
  return data.data
}

export const deleteCoupon = async (id: number): Promise<void> => {
  await http.delete(`/coupons/${id}`)
}

export const previewCoupon = async (code: string, subtotal: number): Promise<CouponPreviewResult> => {
  const { data } = await http.post<ApiResponse<CouponPreviewResult>>('/coupons/preview', {
    code,
    subtotal,
  })
  return data.data
}
