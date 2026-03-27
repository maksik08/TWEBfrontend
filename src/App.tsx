import { useEffect } from 'react'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router/router'
import { QueryProvider } from '@/app/providers/query-provider'
import { ErrorBoundary } from '@/app/providers/error-boundary'
import { useAuthBootstrap } from '@/features/auth'
import { useThemeStore } from '@/entities/theme/model/theme.store'
import { LanguageProvider } from '@/shared/i18n'
import { Toaster } from 'react-hot-toast'

const AppContent = () => {
  useAuthBootstrap()
  const theme = useThemeStore((state) => state.theme)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return <RouterProvider router={router} />
}

export const App = () => {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <QueryProvider>
          <AppContent />
          <Toaster position="top-right" />
        </QueryProvider>
      </LanguageProvider>
    </ErrorBoundary>
  )
}

export default App
