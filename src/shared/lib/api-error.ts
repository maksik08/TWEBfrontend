import type { AxiosError } from 'axios'

export interface ApiError {
  message: string
  status?: number
}

export const parseApiError = (error: unknown): ApiError => {
  type ApiErrorResponse = { message?: string }

  if (typeof error === 'object' && error !== null) {
    const axiosError = error as AxiosError<ApiErrorResponse>

    if (axiosError.isAxiosError) {
      return {
        message: axiosError.response?.data?.message ?? 'Unexpected error',
        status: axiosError.response?.status,
      }
    }
  }

  return { message: 'Unknown error' }
}
