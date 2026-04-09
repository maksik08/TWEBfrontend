import { useLanguage } from '@/shared/i18n'
import styles from './search-products.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
}

export const SearchProducts = ({ value, onChange }: Props) => {
  const { t } = useLanguage()

  return (
    <input
      type="text"
      placeholder={t({ ru: 'Поиск оборудования...', en: 'Search equipment...' })}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.searchInput}
    />
  )
}