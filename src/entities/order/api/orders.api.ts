import { http } from '@/shared/api/http'
import type { Order } from '../model/types'

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type PagedResponse<T> = ApiResponse<T[]>

export type CreateOrderItemPayload = {
  productId: number
  quantity: number
}

export type CreateOrderServicesPayload = {
  objectType: string
  installationType: string
  works: string[]
  staffCount: number
  staffRate: number
  installationCost: number
  deliveryCost: number
}

export type CreateOrderPayload = {
  items: CreateOrderItemPayload[]
  recipientName: string
  phone: string
  shippingAddress: string
  city: string
  comment?: string
  services?: CreateOrderServicesPayload
  couponCode?: string
}

export const createOrder = async (payload: CreateOrderPayload): Promise<Order> => {
  const { data } = await http.post<ApiResponse<Order>>('/Orders', payload)
  return data.data
}

export const fetchMyOrders = async (): Promise<Order[]> => {
  const { data } = await http.get<PagedResponse<Order>>('/Orders/mine', {
    params: { pageSize: 50, sortBy: 'createdAt', sortDirection: 'desc' },
  })
  return data.data
}

export const fetchOrderById = async (orderId: number): Promise<Order> => {
  const { data } = await http.get<ApiResponse<Order>>(`/Orders/${orderId}`)
  return data.data
}

export const payOrder = async (orderId: number): Promise<Order> => {
  const { data } = await http.post<ApiResponse<Order>>(`/Orders/${orderId}/pay`)
  return data.data
}

export const cancelOrder = async (orderId: number): Promise<Order> => {
  const { data } = await http.post<ApiResponse<Order>>(`/Orders/${orderId}/cancel`)
  return data.data
}
