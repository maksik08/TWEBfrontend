import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'
import { Link } from 'react-router-dom'

import { useCartStore } from '@/entities/cart/model/cart.store'
import { buildFavoriteKey, useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { getProductRatingSummary, StarRating, useProductFeedbackStore } from '@/entities/product-feedback'
import {
  getProductAvailabilityLabel,
  getProductCategoryLabel,
  getProductDisplayName,
  getProductImageUrl,
} from '../model/product.helpers'
import type { Product } from '../model/types'
import styles from './product-card.module.css'

interface Props {
  product: Product
}

export const ProductCard = ({ product }: Props) => {
  const [imageError, setImageError] = useState(false)
  const add = useCartStore((state) => state.add)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const addLike = useFavoritesStore((state) => state.addLike)
  const reviews = useProductFeedbackStore((state) => state.reviews[String(product.id)] ?? [])

  const favoriteKey = buildFavoriteKey('product', product.id)
  const likes = useFavoritesStore((state) => state.likes[favoriteKey] ?? 0)
  const isFavorite = useFavoritesStore((state) =>
    state.favorites.some((favorite) => favorite.key === favoriteKey),
  )

  const productUrl = `/catalog/${product.id}`
  const ratingSummary = getProductRatingSummary(reviews)
  const imageUrl = getProductImageUrl(product)
  const hasImage = Boolean(imageUrl && !imageError)
  const displayName = getProductDisplayName(product)
  const summaryText =
    product.shortDescription ??
    `${displayName} с полезными характеристиками, готовый для установки в домашнюю или офисную сеть.`

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
              description: `Категория: ${getProductCategoryLabel(product.category)}`,
              priceLabel: `$${product.price.toFixed(2)}`,
              metaLabel: 'Товар',
              href: productUrl,
            })
          }
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <FiStar size={16} />
        </button>

        {hasImage ? (
          <Link to={productUrl} className={styles.imageLink}>
            <img src={imageUrl} alt={displayName} onError={() => setImageError(true)} />
          </Link>
        ) : (
          <Link to={productUrl} className={styles.noImage}>
            Нет фото
          </Link>
        )}

        <div className={styles.badge}>{getProductAvailabilityLabel(product.availability)}</div>
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{getProductCategoryLabel(product.category)}</span>

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
        </div>

        <Link to={productUrl} className={styles.detailsLink}>
          Подробнее
        </Link>
      </div>

      <div className={styles.footer}>
        <button
          type="button"
          className={`${styles.iconButton} ${likes > 0 ? styles.iconButtonActive : ''}`}
          onClick={() => addLike(favoriteKey)}
          title="Поставить лайк"
        >
          <FiHeart size={18} />
          {likes > 0 && <span className={styles.likesCount}>{likes}</span>}
        </button>

        <button
          type="button"
          className={styles.addButton}
          title="Добавить в корзину"
          onClick={() => {
            add(product)
            toast.success('Добавлено в корзину')
          }}
        >
          <FiShoppingCart size={18} style={{ marginRight: '0.5rem' }} />
          Купить
        </button>
      </div>
    </article>
  )
}
