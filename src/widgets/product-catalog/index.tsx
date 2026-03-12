import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'

import { products as productsMock, ProductCard, type Product } from '@/entities/product'

import { SearchProducts } from '@/features/search-products'
import { FilterProducts } from '@/features/filter-products'
import { ProductsCounter } from '@/features/products-counter'
import styles from './product-catalog.module.css'

export const ProductCatalog = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const { data: products = [], isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      await new Promise((resolve) => setTimeout(resolve, 350))
      return productsMock
    },
  })

  const filteredProducts = products
    .filter((product) => {
      const query = search.trim().toLowerCase()
      if (!query) return true
      return (product.title || product.name).toLowerCase().includes(query)
    })
    .filter((product) => (category === 'all' ? true : product.category === category))

  const errorMessage =
    error instanceof Error
      ? error.message
      : 'Не удалось загрузить товары. Попробуйте позже.'

  return (
    <section className={styles.catalog}>
      <div className="container">
        <div className={styles.catalogHeader}>
          <div className={styles.searchBar}>
            <SearchProducts value={search} onChange={setSearch} />
          </div>

          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label className={styles.filterLabel}>Категория</label>
              <FilterProducts current={category} setCategory={setCategory} />
            </div>
          </div>
        </div>

        {isLoading ? (
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
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>Ничего не найдено</h3>
            <p>Попробуйте изменить параметры поиска или фильтрации</p>
          </div>
        )}
      </div>
    </section>
  )
}
