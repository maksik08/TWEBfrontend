import type { Equipment } from '@/entities/equipment/model/types'
import type { Service } from '@/entities/service/model/types'

export interface CartItem {
  equipment?: Equipment
  service?: Service
  quantity: number
}