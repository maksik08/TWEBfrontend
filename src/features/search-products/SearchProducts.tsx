import styles from './search-products.module.css'

interface Props {
  value: string
  onChange: (value: string) => void
}

export const SearchProducts = ({ value, onChange }: Props) => {
  return (
    <input
      type="text"
      placeholder="Поиск оборудования..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={styles.searchInput}
    />
  )
}