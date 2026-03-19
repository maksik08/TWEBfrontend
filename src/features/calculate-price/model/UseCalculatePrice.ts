import { useMutation } from '@tanstack/react-query'
import { calculatePrice } from '@/entities/calculator/api/calculator.api'
import type { CalculateRequest } from '@/entities/calculator/Model/types'
import { parseApiError } from '@/shared/lib/api-error'

export const useCalculatePrice = () => {
  return useMutation({
    mutationFn: (data: CalculateRequest) =>
      calculatePrice(data),

    onError: (error) => {
      const parsed = parseApiError(error)
      console.error(parsed.message)
    },
  })
}
