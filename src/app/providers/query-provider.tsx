import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import toast from 'react-hot-toast'
import { normalizeError } from '@/shared/lib/normalize-error'

const queryClient = new QueryClient({
  defaultOptions: {
    mutations: {
      onError: (error: unknown) => {
        const normalized = normalizeError(error)
        toast.error(normalized.message)
      },
    },
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
