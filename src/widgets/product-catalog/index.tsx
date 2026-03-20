import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiStar } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'

import { ProductCard, type Product } from '@/entities/product'
import { fetchProducts } from '@/entities/product/api/products.api'
import { services } from '@/entities/service/model/mock'
import { promotions } from '@/entities/promotion/model/mock'
import {
  buildFavoriteKey,
  type FavoriteEntityType,
  useFavoritesStore,
} from '@/entities/favorites/model/favorites.store'

import { SearchProducts } from '@/features/search-products'
import { FilterProducts } from '@/features/filter-products'
import { ProductsCounter } from '@/features/products-counter'
import styles from './product-catalog.module.css'

type CatalogSection = 'equipment' | 'services' | 'promotions'
type CatalogSort = 'default' | 'price-asc' | 'price-desc' | 'likes' | 'date' | 'availability'

const SORT_OPTIONS: { value: CatalogSort; label: string }[] = [
  { value: 'default', label: 'По умолчанию' },
  { value: 'price-asc', label: 'Цена: по возрастанию' },
  { value: 'price-desc', label: 'Цена: по убыванию' },
  { value: 'likes', label: 'Популярность' },
  { value: 'date', label: 'Дата обновления' },
  { value: 'availability', label: 'Наличие' },
]

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

const isCatalogSort = (value: string | null): value is CatalogSort =>
  SORT_OPTIONS.some((opt) => opt.value === value)

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
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const likes = useFavoritesStore((state) => state.likes)

  const { data: products = [], isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 60_000,
  })

  const sectionParam = searchParams.get('section')
  const sortParam = searchParams.get('sort')
  const activeSection: CatalogSection = isCatalogSection(sectionParam) ? sectionParam : 'equipment'
  const activeSort: CatalogSort = isCatalogSort(sortParam) ? sortParam : 'default'

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
      : 'Не удалось загрузить товары. Попробуйте позже.'

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
              Оборудование
            </button>
            <button
              type="button"
              className={`${styles.sectionTab} ${
                activeSection === 'services' ? styles.sectionTabActive : ''
              }`}
              onClick={() => updateParams('services', 'default')}
            >
              Услуги
            </button>
            <button
              type="button"
              className={`${styles.sectionTab} ${
                activeSection === 'promotions' ? styles.sectionTabActive : ''
              }`}
              onClick={() => updateParams('promotions', 'default')}
            >
              Акции
            </button>
          </div>

          {activeSection === 'equipment' && (
            <>
              <div className={styles.searchBar}>
                <SearchProducts value={search} onChange={setSearch} />
              </div>

              <div className={styles.filters}>
                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel}>Категория</label>
                  <FilterProducts current={category} setCategory={setCategory} />
                </div>

                <div className={styles.filterGroup}>
                  <label className={styles.filterLabel} htmlFor="catalog-sort">Сортировка</label>
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
              <h3>Загрузка...</h3>
            </div>
          ) : isError ? (
            <div className={styles.emptyState}>
              <h3>Ошибка сети</h3>
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
              <h3>Ничего не найдено</h3>
              <p>Попробуйте изменить параметры поиска или фильтрации</p>
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
                  badge="Услуга"
                  title={service.name}
                  description={service.description}
                  priceLabel={`от $${service.price.toFixed(2)}`}
                  href="/cart?services=1"
                  actionLabel={service.ctaLabel ?? 'Перейти к расчёту'}
                />
              ))}
            </div>

            <div className={styles.catalogFooter}>
              <div className={styles.catalogSummary}>
                Подберите услугу и сразу переходите к расчёту стоимости монтажа.
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
                  actionLabel="Открыть калькулятор"
                />
              ))}
            </div>

            <div className={styles.catalogFooter}>
              <div className={styles.catalogSummary}>
                Акции можно использовать как ориентир перед расчётом проекта и стоимости монтажа.
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
