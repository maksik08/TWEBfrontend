import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type AppLanguage = 'ru' | 'en'

type TranslationInput = {
  ru: string
  en: string
}

type LanguageContextValue = {
  language: AppLanguage
  setLanguage: (language: AppLanguage) => void
  t: (copy: TranslationInput) => string
}

const STORAGE_KEY = 'app-language'

const LanguageContext = createContext<LanguageContextValue | null>(null)

const getInitialLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'ru'
  }

  return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ru'
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<AppLanguage>(getInitialLanguage)

  useEffect(() => {
    document.documentElement.lang = language
    window.localStorage.setItem(STORAGE_KEY, language)
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: (copy) => copy[language],
    }),
    [language],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}
