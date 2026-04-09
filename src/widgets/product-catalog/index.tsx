import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiStar } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { ProductCard, type Product } from '@/entities/product'
import { fetchProducts } from '@/entities/product/api/products.api'
import { useContentStore } from '@/entities/content/model/content.store'
import {
  buildFavoriteKey,
  type FavoriteEntityType,
  useFavoritesStore,
} from '@/entities/favorites/model/favorites.store'

import { SearchProducts } from '@/features/search-products'
import { FilterProducts } from '@/features/filter-products'
import { ProductsCounter } from '@/features/products-counter'
import { useLanguage } from '@/shared/i18n'
import styles from './product-catalog.module.css'

type CatalogSection = 'equipment' | 'services' | 'promotions'
type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'likes' | 'date' | 'availability'

const AVAILABILITY_ORDER: Record<string, number> = {
  'in-stock': 0,
  limited: 1,
  preorder: 2,
}

type CatalogInfoCardProps = {
  entityType: FavoriteEntityType
  entityId: string
  badge: string
  title: string
  description: string
  priceLabel: string
  href: string
  actionLabel: string
}

const isCatalogSection = (value: string | null): value is CatalogSection =>
  value === 'equipment' || value === 'services' || value === 'promotions'

const isCatalogSort = (value: string | null, options: { value: CatalogSort }[]): value is CatalogSort =>
  options.some((opt) => opt.value === value)

const CatalogInfoCard = ({
  entityType,
  entityId,
  badge,
  title,
  description,
  priceLabel,
  href,
  actionLabel,
}: CatalogInfoCardProps) => {
  const { t } = useLanguage()
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const favoriteKey = buildFavoriteKey(entityType, entityId)
  const isFavorite = useFavoritesStore((state) =>
    state.favorites.some((favorite) => favorite.key === favoriteKey),
  )

  return (
    <article className={styles.infoCard}>
      <div className={styles.infoTopRow}>
        <span className={styles.infoBadge}>{badge}</span>
        <button
          type="button"
          className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteButtonActive : ''}`}
          onClick={() =>
            toggleFavorite({
              key: favoriteKey,
              entityType,
              entityId,
              title,
              description,
              priceLabel,
              metaLabel: badge,
              href,
            })
          }
          title={isFavorite ? t({ ru: 'Убрать из избранного', en: 'Remove from favorites' }) : t({ ru: 'Добавить в избранное', en: 'Add to favorites' })}
        >
          <FiStar size={16} />
        </button>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className={styles.infoFooter}>
        <strong>{priceLabel}</strong>
        <Link to={href} className={styles.infoAction}>
          {actionLabel}
        </Link>
      </div>
    </article>
  )
}

export const ProductCatalog = () => {
  const { t } = useLanguage()
  const { services, promotions } = useContentStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const likes = useFavoritesStore((state) => state.likes)

  const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
    { value: 'default', label: t({ ru: 'По умолчанию', en: 'Default' }) },
    { value: 'price-asc', label: t({ ru: 'Цена: по возрастанию', en: 'Price: low to high' }) },
    { value: 'price-desc', label: t({ ru: 'Цена: по убыванию', en: 'Price: high to low' }) },
    { value: 'likes', label: t({ ru: 'Популярность', en: 'Popularity' }) },
    { value: 'date', label: t({ ru: 'Дата обновления', en: 'Update date' }) },
    { value: 'availability', label: t({ ru: 'Наличие', en: 'Availability' }) },
  ]

  const { data: products = [], isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 60_000,
  })

  const sectionParam = searchParams.get('section')
  const sortParam = searchParams.get('sort')
  const activeSection: CatalogSection = isCatalogSection(sectionParam) ? sectionParam : 'equipment'
  const activeSort: CatalogSort = isCatalogSort(sortParam, SORT_OPTIONS) ? sortParam : 'default'

  const updateParams = (nextSection: CatalogSection, nextSort: CatalogSort = activeSort) => {
    const next = new URLSearchParams()
    next.set('section', nextSection)
    if (nextSort !== 'default') next.set('sort', nextSort)
    setSearchParams(next, { preventScrollReset: true })
  }

  const handleSortChange = (value: CatalogSort) => {
    updateParams(activeSection, value)
  }

  const filteredProducts = products
    .filter((product) => {
      const query = search.trim().toLowerCase()
      if (!query) return true
      return (product.title || product.name).toLowerCase().includes(query)
    })
    .filter((product) => (category === 'all' ? true : product.category === category))
    .sort((left, right) => {
      switch (activeSort) {
        case 'price-asc':
          return left.price - right.price
        case 'price-desc':
          return right.price - left.price
        case 'likes': {
          const leftLikes = likes[buildFavoriteKey('product', left.id)] ?? 0
          const rightLikes = likes[buildFavoriteKey('product', right.id)] ?? 0
          return rightLikes !== leftLikes
            ? rightLikes - leftLikes
            : left.title.localeCompare(right.title)
        }
        case 'date': {
          const leftDate = left.updatedAt ? new Date(left.updatedAt).getTime() : 0
          const rightDate = right.updatedAt ? new Date(right.updatedAt).getTime() : 0
          return rightDate - leftDate
        }
        case 'availability': {
          const leftOrder = AVAILABILITY_ORDER[left.availability ?? ''] ?? 3
          const rightOrder = AVAILABILITY_ORDER[right.availability ?? ''] ?? 3
          return leftOrder - rightOrder
        }
        default:
          return 0
      }
    })

  const errorMessage =
    error instanceof Error
      ? error.message
      : t({ ru: 'Не удалось загрузить товары. Попробуйте позже.', en: 'Failed to load products. Please try again.' })

  return (
    <section className={styles.catalog}>
      <div className="container">
        <div className={styles.catalogHeader}>
          <div className={styles.sectionTabs}>
            <button
              type="button"
              className={`${styles.sectionTab} ${
                activeSection === 'equipment' ? styles.sectionTabActive : ''
              }`}
              onClick={() => updateParams('equipment')}
            >
              {t({ ru: 'Оборудование', en: 'Equipment' })}
            </button>
            <button
              type="button"
              className={`${styles.sectionTab} ${
                activeSection === 'services' ? styles.sectionTabActive : ''
              }`}
              onClick={() => updateParams('services', 'default')}
            >
              {t({ ru: 'Услуги', en: 'Services' })}
            </button>
            <button
              type="button"
              className={`${styles.sectionTab} ${
                activeSection === 'promotions' ? styles.sectionTabActive : ''
              }`}
              onClick={() => updateParams('promotions', 'default')}
            >
              {t({ ru: 'Акции', en: 'Promotions' })}
            </button>
          </div>

          {activeSection === 'equipment' && (
            <>
              <div className={styles.searchBar}>
                <SearchProducts value={search} onChange={setSearch} />
              </div>

              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>{t({ ru: 'Категория', en: 'Category' })}</label>
                  <FilterProducts current={category} setCategory={setCategory} />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="catalog-sort">{t({ ru: 'Сортировка', en: 'Sort' })}</label>
                  <select
                    id="catalog-sort"
                    className={styles.sortSelect}
                    value={activeSort}
                    onChange={(e) => handleSortChange(e.target.value as CatalogSort)}
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {activeSection === 'equipment' ? (
          isLoading ? (
            <div className={styles.emptyState}>
              <h3>{t({ ru: 'Загрузка...', en: 'Loading...' })}</h3>
            </div>
          ) : isError ? (
            <div className={styles.emptyState}>
              <h3>{t({ ru: 'Ошибка сети', en: 'Network error' })}</h3>
              <p>{errorMessage}</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              <div className={styles.catalogFooter}>
                <ProductsCounter total={filteredProducts.length} />
                {activeSort !== 'default' && (
                  <div className={styles.catalogSummary}>
                    {SORT_OPTIONS.find((o) => o.value === activeSort)?.label}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <h3>{t({ ru: 'Ничего не найдено', en: 'Nothing found' })}</h3>
              <p>{t({ ru: 'Попробуйте изменить параметры поиска или фильтрации', en: 'Try changing the search or filter parameters' })}</p>
            </div>
          )
        ) : activeSection === 'services' ? (
          <>
            <div className={styles.infoGrid}>
              {services.map((service) => (
                <CatalogInfoCard
                  key={service.id}
                  entityType="service"
                  entityId={service.id}
                  badge={t({ ru: 'Услуга', en: 'Service' })}
                  title={service.name}
                  description={service.description}
                  priceLabel={`от $${service.price.toFixed(2)}`}
                  href="/cart?services=1"
                  actionLabel={service.ctaLabel ?? t({ ru: 'Перейти к расчёту', en: 'Go to calculator' })}
                />
              ))}
            </div>

            <div className={styles.catalogFooter}>
              <div className={styles.catalogSummary}>
                {t({ ru: 'Подберите услугу и сразу переходите к расчёту стоимости монтажа.', en: 'Select a service and proceed directly to installation cost calculation.' })}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.infoGrid}>
              {promotions.map((promotion) => (
                <CatalogInfoCard
                  key={promotion.id}
                  entityType="promotion"
                  entityId={promotion.id}
                  badge={promotion.badge}
                  title={promotion.title}
                  description={promotion.description}
                  priceLabel={promotion.discountLabel}
                  href="/cart?services=1"
                  actionLabel={t({ ru: 'Открыть калькулятор', en: 'Open calculator' })}
                />
              ))}
            </div>

            <div className={styles.catalogFooter}>
              <div className={styles.catalogSummary}>
                {t({ ru: 'Акции можно использовать как ориентир перед расчётом проекта и стоимости монтажа.', en: 'Promotions can be used as a guide before calculating project and installation costs.' })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
