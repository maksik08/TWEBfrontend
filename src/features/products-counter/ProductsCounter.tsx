import { useLanguage } from '@/shared/i18n'
import styles from './products-counter.module.css'

interface Props {
  total: number
}

export const ProductsCounter = ({ total }: Props) => {
  const { t } = useLanguage()

  return (
    <div className={styles.productsCounter}>
      <span>{t({ ru: 'Найдено товаров:', en: 'Products found:' })}</span>
      <span className={styles.countBadge}>{total}</span>
    </div>
  )
}