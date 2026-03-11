import styles from './products-counter.module.css'

interface Props {
  total: number
}

export const ProductsCounter = ({ total }: Props) => {
  return (
    <div className={styles.productsCounter}>
      <span>Найдено товаров:</span>
      <span className={styles.countBadge}>{total}</span>
    </div>
  )
}