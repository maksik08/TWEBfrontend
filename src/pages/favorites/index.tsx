import { Link } from 'react-router-dom'
import { FiStar } from 'react-icons/fi'
import { useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import styles from './favorites.module.css'

export default function FavoritesPage() {
  const favorites = useFavoritesStore((state) => state.favorites)
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <span className={styles.kicker}>Favorites</span>
            <h1 className={styles.title}>Избранное</h1>
            <p className={styles.subtitle}>
              Здесь собраны товары, услуги и акции, которые вы отметили звёздочкой.
            </p>
          </div>
          <div className={styles.counter}>Всего сохранено: {favorites.length}</div>
        </div>

        {favorites.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>Пока пусто</h2>
            <p>
              Откройте каталог, поставьте звёздочку на карточке товара, услуги или акции, и она
              появится здесь.
            </p>
            <Link to="/catalog" className={styles.emptyAction}>
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {favorites.map((item) => (
              <article key={item.key} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.meta}>{item.metaLabel ?? 'Избранное'}</span>
                  <button
                    type="button"
                    className={styles.starButton}
                    onClick={() => toggleFavorite(item)}
                    title="Убрать из избранного"
                  >
                    <FiStar size={16} />
                  </button>
                </div>

                <h2 className={styles.cardTitle}>{item.title}</h2>
                <p className={styles.cardDescription}>{item.description}</p>

                <div className={styles.cardBottom}>
                  <strong className={styles.price}>{item.priceLabel ?? 'Открыть'}</strong>
                  <Link to={item.href} className={styles.openLink}>
                    Перейти
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
