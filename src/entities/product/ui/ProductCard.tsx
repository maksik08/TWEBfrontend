// entities/product/ui/ProductCard.tsx
import { useState } from "react"
import type { Product } from "../model/types"
import styles from './ProductCard.module.css'

interface Props {
  product: Product
  imageFit?: 'contain' | 'cover' // Добавляем проп для выбора режима
}

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
      </div>

    </div>
  )
}