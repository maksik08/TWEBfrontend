import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiBarChart2, FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { useCartStore } from '@/entities/cart/model/cart.store'
import { COMPARE_LIMIT, useCompareStore } from '@/entities/compare/model/compare.store'
import { buildFavoriteKey, useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { getProductRatingSummary, StarRating, useProductFeedbackStore } from '@/entities/product-feedback'
import {
  getProductAvailabilityLabel,
  getProductCategoryLabel,
  getProductDisplayName,
  getProductImageUrl,
} from '../model/product.helpers'
import type { Product } from '../model/types'
import { useLanguage } from '@/shared/i18n'
import styles from './product-card.module.css'

interface Props {
  product: Product
}

export const ProductCard = ({ product }: Props) => {
  const { t, language } = useLanguage()
  const [imageError, setImageError] = useState(false)
  const add = useCartStore((state) => state.add)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const addLike = useFavoritesStore((state) => state.addLike)
  const reviews = useProductFeedbackStore((state) => state.reviews[String(product.id)] ?? [])
  const toggleCompare = useCompareStore((state) => state.toggle)
  const isInCompare = useCompareStore((state) => state.items.some((item) => item.id === product.id))

  const favoriteKey = buildFavoriteKey('product', product.id)
  const likes = useFavoritesStore((state) => state.likes[favoriteKey] ?? 0)
  const isFavorite = useFavoritesStore((state) =>
    state.favorites.some((favorite) => favorite.key === favoriteKey),
  )

  const handleToggleCompare = () => {
    const result = toggleCompare(product)
    if ('removed' in result) {
      toast.success(t({ ru: 'Убрано из сравнения', en: 'Removed from comparison' }))
      return
    }
    if (result.ok) {
      toast.success(t({ ru: 'Добавлено к сравнению', en: 'Added to comparison' }))
      return
    }
    if (result.reason === 'limit') {
      toast.error(
        t({
          ru: `В сравнении уже ${COMPARE_LIMIT} товара — больше нельзя`,
          en: `Comparison already has ${COMPARE_LIMIT} items`,
        }),
      )
      return
    }
    const expected = result.expectedCategory
      ? getProductCategoryLabel(result.expectedCategory, language)
      : ''
    toast.error(
      t({
        ru: `Можно сравнивать только товары одной категории (${expected})`,
        en: `Only products from the same category can be compared (${expected})`,
      }),
    )
  }

  const productUrl = `/catalog/${product.id}`
  const ratingSummary = getProductRatingSummary(reviews)
  const imageUrl = getProductImageUrl(product)
  const hasImage = Boolean(imageUrl && !imageError)
  const displayName = getProductDisplayName(product)
  const summaryText =
    product.shortDescription ??
    t({ ru: `${displayName} с полезными характеристиками, готовый для установки в домашнюю или офисную сеть.`, en: `${displayName} with useful features, ready for installation in a home or office network.` })

  return (
    <article className={styles.productCard}>
      <div className={styles.imageContainer}>
        <button
          type="button"
          className={`${styles.starButton} ${isFavorite ? styles.starButtonActive : ''}`}
          onClick={() =>
            toggleFavorite({
              key: favoriteKey,
              entityType: 'product',
              entityId: String(product.id),
              title: displayName,
              description: `${t({ ru: 'Категория:', en: 'Category:' })} ${getProductCategoryLabel(product.category, language)}`,
              priceLabel: `$${product.price.toFixed(2)}`,
              metaLabel: t({ ru: 'Товар', en: 'Product' }),
              href: productUrl,
            })
          }
          title={isFavorite ? t({ ru: 'Убрать из избранного', en: 'Remove from favorites' }) : t({ ru: 'Добавить в избранное', en: 'Add to favorites' })}
        >
          <FiStar size={16} />
        </button>

        <button
          type="button"
          className={`${styles.compareButton} ${isInCompare ? styles.compareButtonActive : ''}`}
          onClick={handleToggleCompare}
          title={
            isInCompare
              ? t({ ru: 'Убрать из сравнения', en: 'Remove from comparison' })
              : t({ ru: 'Добавить к сравнению', en: 'Add to comparison' })
          }
        >
          <FiBarChart2 size={16} />
        </button>

        {hasImage ? (
          <Link to={productUrl} className={styles.imageLink}>
            <img src={imageUrl} alt={displayName} onError={() => setImageError(true)} />
          </Link>
        ) : (
          <Link to={productUrl} className={styles.noImage}>
            {t({ ru: 'Нет фото', en: 'No photo' })}
          </Link>
        )}

        <div className={styles.badge}>{getProductAvailabilityLabel(product.availability, language)}</div>
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{getProductCategoryLabel(product.category, language)}</span>

        <h3 className={styles.title}>
          <Link to={productUrl} className={styles.titleLink}>
            {displayName}
          </Link>
        </h3>

        <p className={styles.summary}>{summaryText}</p>

        <div className={styles.ratingRow}>
          <StarRating value={ratingSummary.average} readOnly size="sm" />
          <span className={styles.ratingMeta}>
            {ratingSummary.average.toFixed(1)} ({ratingSummary.total})
          </span>
        </div>

        <div className={styles.priceContainer}>
          <span className={styles.price}>${product.price.toFixed(2)}</span>
          {product.availability === 'limited' && typeof product.stockQuantity === 'number' && (
            <span className={styles.stockHint}>
              {t({ ru: 'Осталось', en: 'Left' })} {product.stockQuantity}
            </span>
          )}
        </div>

        <Link to={productUrl} className={styles.detailsLink}>
          {t({ ru: 'Подробнее', en: 'Details' })}
        </Link>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={`${styles.iconButton} ${likes > 0 ? styles.iconButtonActive : ''}`}
          onClick={() => addLike(favoriteKey)}
          title={t({ ru: 'Поставить лайк', en: 'Like' })}
        >
          <FiHeart size={18} />
          {likes > 0 && <span className={styles.likesCount}>{likes}</span>}
        </button>

        <button
          type="button"
          className={styles.addButton}
          title={
            product.availability === 'out-of-stock'
              ? t({ ru: 'Нет в наличии', en: 'Out of stock' })
              : t({ ru: 'Добавить в корзину', en: 'Add to cart' })
          }
          disabled={product.availability === 'out-of-stock'}
          onClick={() => {
            add(product)
            toast.success(t({ ru: 'Добавлено в корзину', en: 'Added to cart' }))
          }}
        >
          <FiShoppingCart size={18} style={{ marginRight: '0.5rem' }} />
          {product.availability === 'out-of-stock'
            ? t({ ru: 'Нет в наличии', en: 'Out of stock' })
            : t({ ru: 'Купить', en: 'Buy' })}
        </button>
      </div>
    </article>
  )
}
