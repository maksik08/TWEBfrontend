export type ObjectType =
  | 'flat'
  | 'house'
  | 'small_office'
  | 'medium_office'

export type InstallationType =
  | 'wireless'
  | 'fiber'
  | 'copper'

export interface SelectedEquipment {
  equipmentId: string
  title: string
  quantity: number
  unitPrice: number
}

export interface CalculateRequest {
  objectType: ObjectType
  works: string[]
  installationType: InstallationType
  selectedEquipment: SelectedEquipment[]
  staffCount: number
  staffRate: number
  installationCost: number
  deliveryCost: number
  comment?: string
}

export interface CalculateResponse {
  total: number
  breakdown: {
    objectBase: number
    installationType: number
    works: number
    equipment: number
    staff: number
    installation: number
    delivery: number
  }
}
