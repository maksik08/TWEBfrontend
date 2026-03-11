<<<<<<< HEAD
// entities/product/ui/ProductCard.tsx
import { useState } from "react"
import type { Product } from "../model/types"
import styles from './ProductCard.module.css'
=======
import { useState } from 'react'
import toast from 'react-hot-toast'
import { FiHeart, FiShoppingCart } from 'react-icons/fi'
import { useCartStore } from '@/entities/cart/model/cart.store'
import type { Product } from '../model/types'
import styles from './product-card.module.css'
>>>>>>> 10206d5 (добавление корзины и простого калькулятора с вкладкой о нас)

interface Props {
  product: Product
  imageFit?: 'contain' | 'cover' // Добавляем проп для выбора режима
}

<<<<<<< HEAD
export const ProductCard = ({ product, imageFit = 'contain' }: Props) => {
  const [likes, setLikes] = useState(0)
  const [isAdded, setIsAdded] = useState(false)
  const [isLiked, setIsLiked] = useState(false)

  const handleLike = () => {
    setLikes(prev => prev + 1)
    setIsLiked(true)
    setTimeout(() => setIsLiked(false), 300)
  }

  const handleAddToCart = () => {
    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
    console.log('Добавлено в корзину:', product)
  }

  return (
    <div className={styles.productCard}>
      
      <div className={styles.imageContainer}>
        <img
          src={product.image}
          alt={product.title}
          style={{ objectFit: imageFit }} // Динамический режим
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.jpg'
          }}
        />
        
        <div className={styles.imageOverlay}>
          <span className={styles.zoomIcon}>🔍</span>
        </div>
        
        {product.category && (
          <span className={styles.categoryBadge}>
            {product.category}
          </span>
        )}
      </div>

      <h3>{product.title}</h3>

      <p className={styles.price}>
        ${product.price}
      </p>

      <div className={styles.cardButtons}>
        <button onClick={handleLike}>
          <span>❤️</span> {likes}
        </button>

        <button
          onClick={handleAddToCart}
          className={isAdded ? styles.addedToCart : ''}
        >
          <span>🛒</span> 
          {isAdded ? ' Добавлено!' : ' В корзину'}
        </button>
=======
export const ProductCard = ({ product }: Props) => {
  const [likes, setLikes] = useState(0)
  const hasImage = product.image && product.image !== 'N/A'
  const add = useCartStore((s) => s.add)

  return (
    <div className={styles.productCard}>
      <div className={styles.imageContainer}>
        {hasImage ? (
          <img src={product.image} alt={product.title} />
        ) : (
          <div style={{ fontSize: '3rem', opacity: 0.3 }}>рџ“¦</div>
        )}
        <div className={styles.badge}>Р’ РЅР°Р»РёС‡РёРё</div>
>>>>>>> 10206d5 (добавление корзины и простого калькулятора с вкладкой о нас)
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
          title="Р”РѕР±Р°РІРёС‚СЊ РІ РёР·Р±СЂР°РЅРЅРѕРµ"
        >
          <FiHeart size={18} />
          {likes > 0 && <span className={styles.likesCount}>{likes}</span>}
        </button>
        <button
          className={styles.addButton}
          title="Добавить в корзину"
          onClick={() => {
            add(product)
            toast.success('Added to cart')
          }}
        >
          <FiShoppingCart size={18} style={{ marginRight: '0.5rem' }} />
          Купить
        </button>
      </div>
    </div>
  )
}
