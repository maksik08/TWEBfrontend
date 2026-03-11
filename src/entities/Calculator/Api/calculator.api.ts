import type { CalculateRequest, CalculateResponse } from '@/entities/calculator/Model/types'
import { calculatePrice as calculatePriceModel } from '@/entities/calculator/Model/calculate'

export const calculatePrice = async (
  data: CalculateRequest,
): Promise<CalculateResponse> => {
  return calculatePriceModel(data)
}
