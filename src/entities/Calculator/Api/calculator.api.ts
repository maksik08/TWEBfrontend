import type { CalculateRequest, CalculateResponse } from '@/entities/Calculator/Model/types'
import { calculatePrice as calculatePriceModel } from '@/entities/Calculator/Model/calculate'

export const calculatePrice = async (
  data: CalculateRequest,
): Promise<CalculateResponse> => {
  return calculatePriceModel(data)
}
