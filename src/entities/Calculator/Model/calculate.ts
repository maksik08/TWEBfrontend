import type { CalculateRequest, CalculateResponse } from './types'

export function calculatePrice(req: CalculateRequest): CalculateResponse {

  let base = 0

  if (req.objectType === 'flat') base = 100
  if (req.objectType === 'house') base = 200
  if (req.objectType === 'small_office') base = 350
  if (req.objectType === 'medium_office') base = 600

  const worksPrice = req.works.length * 50

  return {
    total: base + worksPrice
  }
}