import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router/router'
import { QueryProvider } from '@/app/providers/query-provider'
import { ErrorBoundary } from '@/app/providers/error-boundary'
import { useAuthBootstrap } from '@/features/auth'
import { Toaster } from 'react-hot-toast'

const AppContent = () => {
  useAuthBootstrap()
  return <RouterProvider router={router} />
}

export const App = () => {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AppContent />
        <Toaster position="top-right" />
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
