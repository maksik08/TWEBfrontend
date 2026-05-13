import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiX } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { useCartStore } from '@/entities/cart/model/cart.store'
import { COMPARE_LIMIT, useCompareStore } from '@/entities/compare/model/compare.store'
import {
  getProductAvailabilityLabel,
  getProductCategoryLabel,
  getProductDisplayName,
  getProductImageUrl,
} from '@/entities/product/model/product.helpers'
import type { Product } from '@/entities/product/model/types'
import { useLanguage } from '@/shared/i18n'
import styles from './compare.module.css'

type Row = {
  label: string
  values: string[]
  differs: boolean
}

const collectSpecLabels = (items: Product[]): string[] => {
  const seen = new Set<string>()
  const ordered: string[] = []
  for (const item of items) {
    for (const spec of item.specifications ?? []) {
      if (!seen.has(spec.label)) {
        seen.add(spec.label)
        ordered.push(spec.label)
      }
    }
  }
  return ordered
}

const getSpecValue = (product: Product, label: string) =>
  product.specifications?.find((spec) => spec.label === label)?.value ?? '—'

export default function ComparePage() {
  const { t, language } = useLanguage()
  const items = useCompareStore((state) => state.items)
  const remove = useCompareStore((state) => state.remove)
  const clear = useCompareStore((state) => state.clear)
  const addToCart = useCartStore((state) => state.add)
  const [onlyDifferences, setOnlyDifferences] = useState(false)

  const rows = useMemo<Row[]>(() => {
    if (items.length === 0) return []

    const baseRows: Row[] = [
      {
        label: t({ ru: 'Цена', en: 'Price' }),
        values: items.map((p) => `$${p.price.toFixed(2)}`),
        differs: new Set(items.map((p) => p.price)).size > 1,
      },
      {
        label: t({ ru: 'Бренд', en: 'Brand' }),
        values: items.map((p) => p.brand ?? '—'),
        differs: new Set(items.map((p) => p.brand ?? '')).size > 1,
      },
      {
        label: t({ ru: 'Артикул', en: 'SKU' }),
        values: items.map((p) => p.sku ?? '—'),
        differs: new Set(items.map((p) => p.sku ?? '')).size > 1,
      },
      {
        label: t({ ru: 'Наличие', en: 'Availability' }),
        values: items.map((p) => getProductAvailabilityLabel(p.availability, language)),
        differs: new Set(items.map((p) => p.availability ?? 'in-stock')).size > 1,
      },
      {
        label: t({ ru: 'Гарантия', en: 'Warranty' }),
        values: items.map((p) => p.warranty ?? '—'),
        differs: new Set(items.map((p) => p.warranty ?? '')).size > 1,
      },
    ]

    const specLabels = collectSpecLabels(items)
    const specRows: Row[] = specLabels.map((label) => {
      const values = items.map((p) => getSpecValue(p, label))
      return {
        label,
        values,
        differs: new Set(values).size > 1,
      }
    })

    return [...baseRows, ...specRows]
  }, [items, language, t])

  const visibleRows = onlyDifferences ? rows.filter((row) => row.differs) : rows

  if (items.length === 0) {
    return (
      <div className={styles.page}>
        <div className="container">
          <div className={styles.headerRow}>
            <div>
              <span className={styles.kicker}>Compare</span>
              <h1 className={styles.title}>{t({ ru: 'Сравнение товаров', en: 'Compare products' })}</h1>
            </div>
          </div>

          <div className={styles.emptyState}>
            <h2>{t({ ru: 'Список пуст', en: 'Nothing to compare' })}</h2>
            <p>
              {t({
                ru: `Добавьте до ${COMPARE_LIMIT} товаров одной категории, чтобы сравнить характеристики.`,
                en: `Add up to ${COMPARE_LIMIT} products from the same category to compare specifications.`,
              })}
            </p>
            <Link to="/catalog" className={styles.emptyAction}>
              {t({ ru: 'Перейти в каталог', en: 'Go to catalog' })}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.headerRow}>
          <div>
            <span className={styles.kicker}>Compare</span>
            <h1 className={styles.title}>{t({ ru: 'Сравнение товаров', en: 'Compare products' })}</h1>
            <p className={styles.subtitle}>
              {t({ ru: 'Категория:', en: 'Category:' })}{' '}
              <strong>{getProductCategoryLabel(items[0].category, language)}</strong>
              {' · '}
              {items.length} / {COMPARE_LIMIT}
            </p>
          </div>

          <div className={styles.controls}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={onlyDifferences}
                onChange={(e) => setOnlyDifferences(e.target.checked)}
              />
              <span>{t({ ru: 'Только различия', en: 'Differences only' })}</span>
            </label>
            <button type="button" className={styles.clearButton} onClick={clear}>
              {t({ ru: 'Очистить', en: 'Clear all' })}
            </button>
          </div>
        </div>

        <div className={styles.tableScroll}>
          <table
            className={styles.table}
            style={{ gridTemplateColumns: `220px repeat(${items.length}, minmax(220px, 1fr))` }}
          >
            <thead>
              <tr className={styles.headRow}>
                <th className={`${styles.cell} ${styles.headCellLabel}`} aria-label="spec" />
                {items.map((product) => {
                  const imageUrl = getProductImageUrl(product)
                  return (
                    <th key={product.id} className={`${styles.cell} ${styles.headCell}`}>
                      <button
                        type="button"
                        className={styles.removeButton}
                        onClick={() => remove(product.id)}
                        title={t({ ru: 'Убрать', en: 'Remove' })}
                      >
                        <FiX size={16} />
                      </button>
                      <Link to={`/catalog/${product.id}`} className={styles.productImageLink}>
                        {imageUrl ? (
                          <img src={imageUrl} alt={getProductDisplayName(product)} />
                        ) : (
                          <div className={styles.noImage}>{t({ ru: 'Нет фото', en: 'No photo' })}</div>
                        )}
                      </Link>
                      <Link to={`/catalog/${product.id}`} className={styles.productName}>
                        {getProductDisplayName(product)}
                      </Link>
                      <div className={styles.productPrice}>${product.price.toFixed(2)}</div>
                      <button
                        type="button"
                        className={styles.buyButton}
                        onClick={() => {
                          addToCart(product)
                          toast.success(t({ ru: 'Добавлено в корзину', en: 'Added to cart' }))
                        }}
                      >
                        <FiShoppingCart size={14} />
                        {t({ ru: 'В корзину', en: 'To cart' })}
                      </button>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {visibleRows.length === 0 ? (
                <tr className={styles.row}>
                  <td className={`${styles.cell} ${styles.emptyDiff}`} style={{ gridColumn: `span ${items.length + 1}` }}>
                    {t({ ru: 'Различий нет — все характеристики совпадают.', en: 'No differences — all specifications match.' })}
                  </td>
                </tr>
              ) : (
                visibleRows.map((row) => (
                  <tr key={row.label} className={`${styles.row} ${row.differs ? styles.rowDiff : ''}`}>
                    <td className={`${styles.cell} ${styles.labelCell}`}>{row.label}</td>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${items[index].id}`} className={styles.cell}>
                        {value}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
