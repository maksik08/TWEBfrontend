import { useEffect, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import {
  FiArrowLeft,
  FiHeart,
  FiMessageSquare,
  FiPackage,
  FiShield,
  FiShoppingCart,
} from 'react-icons/fi'
import { Link, useParams } from 'react-router-dom'

import { useCartStore } from '@/entities/cart/model/cart.store'
import { buildFavoriteKey, useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { fetchProducts } from '@/entities/product/api/products.api'
import {
  getProductAvailabilityLabel,
  getProductCategoryLabel,
  getProductDisplayName,
  getProductImageUrl,
  type Product,
} from '@/entities/product'
import { getProductRatingSummary, StarRating, useProductFeedbackStore } from '@/entities/product-feedback'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useProfileStore } from '@/entities/user/model/profile.store'
import { useLanguage } from '@/shared/i18n'
import styles from './product-detail.module.css'

const reviewDateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const buildAuthorName = (username?: string, firstName?: string, lastName?: string) => {
  const profileName = `${firstName ?? ''} ${lastName ?? ''}`.trim()
  return username ?? (profileName || 'Гость')
}

export default function ProductDetailPage() {
  const { productId: productIdParam } = useParams()
  const productId = Number(productIdParam)

  const add = useCartStore((state) => state.add)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)
  const addReview = useProductFeedbackStore((state) => state.addReview)
  const reviews = useProductFeedbackStore((state) => state.reviews[String(productId)] ?? [])
  const sessionUser = useSessionStore((state) => state.user)
  const firstName = useProfileStore((state) => state.firstName)
  const lastName = useProfileStore((state) => state.lastName)

  const { t, language } = useLanguage()
  const defaultAuthor = buildAuthorName(sessionUser?.username, firstName, lastName)
  const [authorName, setAuthorName] = useState(defaultAuthor)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')

  useEffect(() => {
    setAuthorName(defaultAuthor)
  }, [defaultAuthor])

  const { data: products = [], isLoading, isError, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: fetchProducts,
    staleTime: 60_000,
  })

  const product = products.find((item) => item.id === productId)
  const favoriteKey = buildFavoriteKey('product', productId)
  const isFavorite = useFavoritesStore((state) =>
    state.favorites.some((favorite) => favorite.key === favoriteKey),
  )
  const ratingSummary = getProductRatingSummary(reviews)
  const heroSpecs = product?.specifications?.slice(0, 3) ?? []
  const imageUrl = product ? getProductImageUrl(product) : undefined
  const displayName = product ? getProductDisplayName(product) : t({ ru: 'Товар', en: 'Product' })
  const errorMessage =
    error instanceof Error ? error.message : t({ ru: 'Не удалось загрузить данные о товаре.', en: 'Failed to load product data.' })

  const handleAddToCart = () => {
    if (!product) {
      return
    }

    add(product)
    toast.success(t({ ru: 'Товар добавлен в корзину', en: 'Product added to cart' }))
  }

  const handleToggleFavorite = () => {
    if (!product) {
      return
    }

    toggleFavorite({
      key: favoriteKey,
      entityType: 'product',
      entityId: String(product.id),
      title: displayName,
      description: `${t({ ru: 'Категория:', en: 'Category:' })} ${getProductCategoryLabel(product.category, language)}`,
      priceLabel: `$${product.price.toFixed(2)}`,
      metaLabel: t({ ru: 'Товар', en: 'Product' }),
      href: `/catalog/${product.id}`,
    })
  }

  const handleSubmitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!product) {
      return
    }

    if (!comment.trim()) {
      toast.error(t({ ru: 'Напишите комментарий к товару', en: 'Please write a comment' }))
      return
    }

    addReview({
      productId: product.id,
      author: authorName.trim() || defaultAuthor,
      rating,
      comment,
    })

    setComment('')
    setRating(0)
    toast.success(t({ ru: 'Комментарий опубликован', en: 'Comment published' }))
  }

  return (
    <section className={styles.page}>
      <div className="container">
        <Link to="/catalog?section=equipment" className={styles.backLink}>
          <FiArrowLeft size={16} />
          {t({ ru: 'Назад к каталогу', en: 'Back to catalog' })}
        </Link>

        {isLoading ? (
          <div className={styles.stateCard}>
            <h1>{t({ ru: 'Загрузка...', en: 'Loading...' })}</h1>
            <p>{t({ ru: 'Подготавливаем подробную информацию о товаре.', en: 'Preparing detailed product information.' })}</p>
          </div>
        ) : isError ? (
          <div className={styles.stateCard}>
            <h1>{t({ ru: 'Ошибка загрузки', en: 'Loading error' })}</h1>
            <p>{errorMessage}</p>
          </div>
        ) : !product || Number.isNaN(productId) ? (
          <div className={styles.stateCard}>
            <h1>{t({ ru: 'Товар не найден', en: 'Product not found' })}</h1>
            <p>{t({ ru: 'Возможно, ссылка устарела или товар был удалён из каталога.', en: 'The link may be outdated or the product was removed from the catalog.' })}</p>
          </div>
        ) : (
          <>
            <div className={styles.hero}>
              <div className={styles.mediaPanel}>
                {imageUrl ? (
                  <img src={imageUrl} alt={displayName} className={styles.heroImage} />
                ) : (
                  <div className={styles.heroPlaceholder}>{t({ ru: 'Нет изображения', en: 'No image' })}</div>
                )}
              </div>

              <div className={styles.infoPanel}>
                <div className={styles.badges}>
                  <span className={styles.categoryBadge}>
                    {getProductCategoryLabel(product.category, language)}
                  </span>
                  <span className={styles.stockBadge}>
                    {getProductAvailabilityLabel(product.availability, language)}
                  </span>
                </div>

                <h1 className={styles.title}>{displayName}</h1>
                <p className={styles.subtitle}>{product.shortDescription}</p>

                <div className={styles.ratingBox}>
                  <StarRating value={ratingSummary.average} readOnly size="md" />
                  <div>
                    <strong>{ratingSummary.average.toFixed(1)} / 5</strong>
                    <p>{ratingSummary.total} {t({ ru: 'отзывов', en: 'reviews' })}</p>
                  </div>
                </div>

                <div className={styles.priceRow}>
                  <div>
                    <span className={styles.priceLabel}>{t({ ru: 'Цена', en: 'Price' })}</span>
                    <div className={styles.price}>${product.price.toFixed(2)}</div>
                  </div>
                  <div className={styles.skuBox}>
                    <span>SKU</span>
                    <strong>{product.sku}</strong>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button type="button" className={styles.primaryAction} onClick={handleAddToCart}>
                    <FiShoppingCart size={18} />
                    {t({ ru: 'Добавить в корзину', en: 'Add to cart' })}
                  </button>
                  <button
                    type="button"
                    className={`${styles.secondaryAction} ${isFavorite ? styles.secondaryActionActive : ''}`}
                    onClick={handleToggleFavorite}
                  >
                    <FiHeart size={18} />
                    {isFavorite ? t({ ru: 'В избранном', en: 'In favorites' }) : t({ ru: 'В избранное', en: 'Add to favorites' })}
                  </button>
                </div>

                <div className={styles.quickSpecs}>
                  {heroSpecs.map((spec) => (
                    <article key={spec.label} className={styles.quickSpecCard}>
                      <span>{spec.label}</span>
                      <strong>{spec.value}</strong>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className={styles.layout}>
              <div className={styles.mainColumn}>
                <article className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <h2>{t({ ru: 'Описание', en: 'Description' })}</h2>
                  </div>
                  <p className={styles.description}>{product.description}</p>
                  <div className={styles.featureList}>
                    {product.keyFeatures?.map((feature) => (
                      <div key={feature} className={styles.featureItem}>
                        {feature}
                      </div>
                    ))}
                  </div>
                </article>

                <article className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <h2>{t({ ru: 'Используемые технологии', en: 'Technologies used' })}</h2>
                  </div>
                  <div className={styles.techList}>
                    {product.technology?.map((item) => (
                      <span key={item} className={styles.techTag}>
                        {item}
                      </span>
                    ))}
                  </div>
                </article>

                <article className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <h2>{t({ ru: 'Комментарии и рейтинг', en: 'Reviews & rating' })}</h2>
                    <span>{reviews.length} {t({ ru: 'записей', en: 'entries' })}</span>
                  </div>

                  <div className={styles.reviewSummary}>
                    <div className={styles.reviewSummaryScore}>
                      <strong>{ratingSummary.average.toFixed(1)}</strong>
                      <span>{t({ ru: 'Средняя оценка', en: 'Average rating' })}</span>
                    </div>
                    <div className={styles.reviewSummaryMeta}>
                      <StarRating value={ratingSummary.average} readOnly size="md" />
                      <p>
                        {t({ ru: 'Пользователи оценивают товар по удобству, качеству сборки и полезности характеристик.', en: 'Users rate products by usability, build quality, and usefulness of features.' })}
                      </p>
                    </div>
                  </div>

                  <form className={styles.reviewForm} onSubmit={handleSubmitReview}>
                    <div className={styles.formGrid}>
                      <label className={styles.field}>
                        <span>{t({ ru: 'Имя', en: 'Name' })}</span>
                        <input
                          value={authorName}
                          onChange={(event) => setAuthorName(event.target.value)}
                          placeholder={t({ ru: 'Ваше имя', en: 'Your name' })}
                        />
                      </label>

                      <label className={styles.field}>
                        <span>{t({ ru: 'Оценка', en: 'Rating' })}</span>
                        <div className={styles.ratingInput}>
                          <StarRating value={rating} onChange={setRating} size="lg" showValue />
                        </div>
                      </label>
                    </div>

                    <label className={styles.field}>
                      <span>{t({ ru: 'Комментарий', en: 'Comment' })}</span>
                      <textarea
                        value={comment}
                        onChange={(event) => setComment(event.target.value)}
                        placeholder={t({ ru: 'Расскажите, что понравилось: порты, технологии, стабильность работы, комплектация...', en: 'Tell us what you liked: ports, technologies, stability, package contents...' })}
                        rows={5}
                      />
                    </label>

                    <button type="submit" className={styles.reviewButton}>
                      <FiMessageSquare size={18} />
                      {t({ ru: 'Опубликовать комментарий', en: 'Publish comment' })}
                    </button>
                  </form>

                  <div className={styles.reviewList}>
                    {reviews.map((review) => (
                      <article key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewCardTop}>
                          <div>
                            <strong>{review.author}</strong>
                            <span>{reviewDateFormatter.format(new Date(review.createdAt))}</span>
                          </div>
                          <div className={styles.reviewRating}>
                            <StarRating value={review.rating} readOnly size="sm" />
                            <span>{review.rating.toFixed(1)} / 5</span>
                          </div>
                        </div>
                        <p>{review.comment}</p>
                      </article>
                    ))}
                  </div>
                </article>
              </div>

              <aside className={styles.sidebar}>
                <article className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <h2>{t({ ru: 'Характеристики', en: 'Specifications' })}</h2>
                  </div>

                  <dl className={styles.specList}>
                    {product.specifications?.map((spec) => (
                      <div key={spec.label} className={styles.specRow}>
                        <dt>{spec.label}</dt>
                        <dd>{spec.value}</dd>
                      </div>
                    ))}
                  </dl>
                </article>

                <article className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <h2>{t({ ru: 'Комплектация', en: 'Package contents' })}</h2>
                  </div>

                  <ul className={styles.packageList}>
                    {product.packageContents?.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>

                <article className={styles.card}>
                  <div className={styles.sectionHeader}>
                    <h2>{t({ ru: 'Полезная информация', en: 'Useful information' })}</h2>
                  </div>

                  <div className={styles.infoTiles}>
                    <div className={styles.infoTile}>
                      <FiPackage size={18} />
                      <div>
                        <strong>{t({ ru: 'Поставка', en: 'Supply' })}</strong>
                        <span>{t({ ru: 'Подготовлен для сетевых инсталляций и быстрого запуска.', en: 'Ready for network installations and quick deployment.' })}</span>
                      </div>
                    </div>

                    <div className={styles.infoTile}>
                      <FiShield size={18} />
                      <div>
                        <strong>{t({ ru: 'Гарантия', en: 'Warranty' })}</strong>
                        <span>{product.warranty}</span>
                      </div>
                    </div>
                  </div>
                </article>
              </aside>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
