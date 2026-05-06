export type OrderStatus = 'Pending' | 'Paid' | 'Shipped' | 'Completed' | 'Cancelled'

export interface OrderItem {
  id: number
  productId: number
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  id: number
  userId: number
  userName?: string
  status: OrderStatus
  subtotal: number
  paidAt?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}
