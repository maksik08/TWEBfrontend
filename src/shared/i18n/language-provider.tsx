import { useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getInitialLanguage,
  LanguageContext,
  STORAGE_KEY,
  type AppLanguage,
  type LanguageContextValue,
} from './language-context'

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
