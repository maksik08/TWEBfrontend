import styles from './filter-products.module.css'

interface Props {
  current: string
  setCategory: (v: string) => void
}

export const FilterProducts = ({ current, setCategory }: Props) => {
  const categories = [
    { id: 'all', label: 'Все категории' },
    { id: 'router', label: 'Маршрутизаторы' },
    { id: 'switch', label: 'Коммутаторы' },
    { id: 'antenna', label: 'Антенны' },
    { id: 'cable', label: 'Кабели' },
    { id: 'nas', label: 'NAS' },
    { id: 'server', label: 'Серверы' },
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
