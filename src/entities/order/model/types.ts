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
  recipientName?: string
  phone?: string
  shippingAddress?: string
  city?: string
  comment?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}
