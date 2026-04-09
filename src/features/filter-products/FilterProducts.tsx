import { useLanguage } from '@/shared/i18n'
import styles from './filter-products.module.css'

interface Props {
  current: string
  setCategory: (value: string) => void
}

export const FilterProducts = ({ current, setCategory }: Props) => {
  const { t } = useLanguage()
  const categories = [
    { id: 'all', label: t({ ru: 'Все категории', en: 'All categories' }) },
    { id: 'router', label: t({ ru: 'Маршрутизаторы', en: 'Routers' }) },
    { id: 'switch', label: t({ ru: 'Коммутаторы', en: 'Switches' }) },
    { id: 'antenna', label: t({ ru: 'Антенны', en: 'Antennas' }) },
    { id: 'cable', label: t({ ru: 'Кабели', en: 'Cables' }) },
    { id: 'nas', label: 'NAS' },
    { id: 'server', label: t({ ru: 'Серверы', en: 'Servers' }) },
  ]

  return (
    <div className={styles.filterContainer}>
      {categories.map((category) => (
        <button
          key={category.id}
          className={`${styles.filterButton} ${current === category.id ? styles.active : ''}`}
          onClick={() => setCategory(category.id)}
        >
          {category.label}
        </button>
      ))}
    </div>
  )
}
