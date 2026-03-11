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

<<<<<<< HEAD
   <button
    style={{ fontWeight: current === "all" ? "bold" : "normal" }}
    onClick={() => setCategory("all")}
   >
    Все
   </button>

   <button
    style={{ fontWeight: current === "router" ? "bold" : "normal" }}
    onClick={() => setCategory("router")}
   >
    Router
   </button>

   <button
    style={{ fontWeight: current === "switch" ? "bold" : "normal" }}
    onClick={() => setCategory("switch")}
   >
    Switch
   </button>

    <button
    style={{ fontWeight: current === "extender" ? "bold" : "normal" }}
    onClick={() => setCategory("extender")}
   >
    Extender
   </button>


  </div>
 )
=======
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
>>>>>>> 10206d5 (добавление корзины и простого калькулятора с вкладкой о нас)
}