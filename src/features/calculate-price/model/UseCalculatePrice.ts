import { useMutation } from '@tanstack/react-query'
import { calculatePrice } from '@/entities/Calculator/Api/calculator.api'
import type { CalculateRequest } from '@/entities/Calculator/Model/types'
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
