import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiHeart, FiShoppingCart, FiStar } from 'react-icons/fi'

import { useCartStore } from '@/entities/cart/model/cart.store'
import { buildFavoriteKey, useFavoritesStore } from '@/entities/favorites/model/favorites.store'
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

  const favoriteKey = buildFavoriteKey('product', product.id)
  const likes = useFavoritesStore((state) => state.likes[favoriteKey] ?? 0)
  const isFavorite = useFavoritesStore((state) =>
    state.favorites.some((favorite) => favorite.key === favoriteKey),
  )

  const imageUrl =
    product.image && product.image !== 'N/A'
      ? product.image.startsWith('http') || product.image.startsWith('/')
        ? product.image
        : `/images/product/${product.image}`
      : undefined

  const hasImage = Boolean(imageUrl && !imageError)

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        <button
          type="button"
          className={`${styles.starButton} ${isFavorite ? styles.starButtonActive : ''}`}
          onClick={() =>
            toggleFavorite({
              key: favoriteKey,
              entityType: 'product',
              entityId: String(product.id),
              title: product.title || product.name,
              description: `Категория: ${product.category}`,
              priceLabel: `$${product.price.toFixed(2)}`,
              metaLabel: 'Товар',
              href: '/catalog?section=equipment',
            })
          }
          title={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        >
          <FiStar size={16} />
        </button>

        {hasImage ? (
          <img src={imageUrl} alt={product.title} onError={() => setImageError(true)} />
        ) : (
          <div className={styles.noImage}>Нет фото</div>
        )}
        <div className={styles.badge}>В наличии</div>
      </div>

      <div className={styles.content}>
        <span className={styles.category}>{product.category}</span>
        <h3 className={styles.title}>{product.title || product.name}</h3>

        <div className={styles.priceContainer}>
          <span className={styles.price}>${product.price}</span>
        </div>
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
    </div>
  )
}
