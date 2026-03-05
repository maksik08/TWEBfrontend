export type ObjectType =
  | 'flat'
  | 'house'
  | 'small_office'
  | 'medium_office'

export type InstallationType =
  | 'wireless'
  | 'fiber'
  | 'copper'

export interface CalculateRequest {
  objectType: ObjectType
  works: string[]
  installationType: InstallationType
}

export interface CalculateResponse {
  total: number
}