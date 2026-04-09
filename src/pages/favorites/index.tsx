import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import { useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { useLanguage } from '@/shared/i18n'
import styles from './favorites.module.css'

export default function FavoritesPage() {
  const { t } = useLanguage()
  const favorites = useFavoritesStore((state) => state.favorites)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Favorites</span>
            <h1 className={styles.title}>{t({ ru: 'Избранное', en: 'Favorites' })}</h1>
            <p className={styles.subtitle}>
              {t({ ru: 'Здесь собраны товары, услуги и акции, которые вы отметили звёздочкой.', en: 'Here are the products, services, and promotions you have starred.' })}
            </p>
          </div>
          <div className={styles.counter}>{t({ ru: 'Всего сохранено:', en: 'Total saved:' })} {favorites.length}</div>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>{t({ ru: 'Пока пусто', en: 'Nothing here yet' })}</h2>
            <p>
              {t({ ru: 'Откройте каталог, поставьте звёздочку на карточке товара, услуги или акции, и она появится здесь.', en: 'Open the catalog, star a product, service, or promotion card, and it will appear here.' })}
            </p>
            <Link to="/catalog" className={styles.emptyAction}>
              {t({ ru: 'Перейти в каталог', en: 'Go to catalog' })}
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((item) => (
              <article key={item.key} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.meta}>{item.metaLabel ?? t({ ru: 'Избранное', en: 'Favorite' })}</span>
                  <button
                    type="button"
                    className={styles.starButton}
                    onClick={() => toggleFavorite(item)}
                    title={t({ ru: 'Убрать из избранного', en: 'Remove from favorites' })}
                  >
                    <FiStar size={16} />
                  </button>
                </div>

                <h2 className={styles.cardTitle}>{item.title}</h2>
                <p className={styles.cardDescription}>{item.description}</p>

                <div className={styles.cardBottom}>
                  <strong className={styles.price}>{item.priceLabel ?? t({ ru: 'Открыть', en: 'Open' })}</strong>
                  <Link to={item.href} className={styles.openLink}>
                    {t({ ru: 'Перейти', en: 'Go' })}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
