import { createContext, useContext } from 'react'

export type AppLanguage = 'ru' | 'en'

export type TranslationInput = {
  ru: string
  en: string
}

export type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  t: (copy: TranslationInput) => string
}

export const STORAGE_KEY = 'app-language'

export const LanguageContext = createContext<LanguageContextValue | null>(null)

export const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ru'
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}

