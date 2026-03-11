import { useState } from 'react'

import { products, ProductCard } from '@/entities/product'

import { SearchProducts } from '@/features/search-products'
import { FilterProducts } from '@/features/filter-products'
import { ProductsCounter } from '@/features/products-counter'
import styles from './product-catalog.module.css'

export const ProductCatalog = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')

  const filteredProducts = products
    .filter((product: typeof products[0]) =>
      product.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((product: typeof products[0]) =>
      category === 'all' ? true : product.category === category
    )

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

        {filteredProducts.length > 0 ? (
          <>
            <div className={styles.productGrid}>
              {filteredProducts.map((product: typeof products[0]) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className={styles.catalogFooter}>
              <ProductsCounter total={filteredProducts.length} />
            </div>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>Товары не найдены</h3>
            <p>Попробуйте изменить параметры поиска или фильтрации</p>
          </div>
        )}
      </div>
    </section>
  )
}
