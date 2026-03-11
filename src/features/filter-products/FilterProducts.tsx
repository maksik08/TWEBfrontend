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