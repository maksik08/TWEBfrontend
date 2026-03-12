import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'

import { useCartStore } from '@/entities/cart/model/cart.store'
import type { Product } from '../model/types'
import styles from './product-card.module.css'

interface Props {
  product: Product
}

export const ProductCard = ({ product }: Props) => {
  const [likes, setLikes] = useState(0)
  const hasImage = Boolean(product.image && product.image !== 'N/A')
  const add = useCartStore((state) => state.add)

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div style={{ fontSize: '0.9rem', opacity: 0.6 }}>Нет фото</div>
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
          className={`${styles.iconButton} ${likes > 0 ? styles.active : ''}`}
          onClick={() => setLikes(likes + 1)}
          title="Добавить в избранное"
        >
          <FiHeart size={18} />
          {likes > 0 && <span className={styles.likesCount}>{likes}</span>}
        </button>
        <button
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
