import { Link } from 'react-router-dom'
import { FiHeart, FiMenu, FiShoppingCart } from 'react-icons/fi'
import { useCartStore, selectCartCount } from '@/entities/cart/model/cart.store'
import { useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useProfileStore } from '@/entities/user/model/profile.store'
import styles from './header.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

export const Header = () => {
  const cartCount = useCartStore((state) => selectCartCount(state.items))
  const totalLikes = useFavoritesStore((state) =>
    Object.values(state.likes).reduce((sum, value) => sum + value, 0),
  )
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const sessionUser = useSessionStore((state) => state.user)
  const logout = useSessionStore((state) => state.logout)
  const firstName = useProfileStore((state) => state.firstName)
  const lastName = useProfileStore((state) => state.lastName)
  const avatarUrl = useProfileStore((state) => state.avatarUrl)
  const balance = useProfileStore((state) => state.balance)
  const stats = useProfileStore((state) => state.stats)

  const displayName = sessionUser?.username ?? `${firstName} ${lastName}`.trim()
  const displayMeta = sessionUser?.email ?? 'Личный кабинет'
  const initials = `${displayName?.[0] ?? ''}${displayName?.[1] ?? ''}`.toUpperCase()

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.inner}>
          <Link to="/" className={styles.logo}>
            NetInstall
          </Link>

          <nav className={styles.nav}>
            <Link to="/catalog" className={styles.navLink}>
              Каталог
            </Link>
            <Link to="/favorites" className={styles.navLink}>
              Избранное
            </Link>
            <Link to="/about" className={styles.navLink}>
              О нас
            </Link>
          </nav>

          <div className={styles.actions}>
            <Link
              to="/catalog?section=equipment&sort=likes"
              className={styles.iconButton}
              aria-label="Popular products"
              title="Показать самые лайкнутые товары"
            >
              <FiHeart size={20} />
              {totalLikes > 0 && <span className={styles.likesBadge}>{totalLikes}</span>}
            </Link>

            <Link to="/cart" className={styles.iconButton} aria-label="Cart">
              <FiShoppingCart size={20} />
              <span className={styles.cartBadge}>{cartCount}</span>
            </Link>

            {isAuthenticated ? (
              <div className={styles.profileCard}>
                <Link to="/profile" className={styles.profileLink}>
                  <div className={styles.avatarFrame} aria-hidden="true">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt={`${firstName} ${lastName}`} />
                    ) : (
                      <span className={styles.avatarInitials}>{initials || 'U'}</span>
                    )}
                  </div>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>{displayName}</div>
                    <div className={styles.profileMeta}>
                      <span>{displayMeta}</span>
                      <span className={styles.profileBalance}>Баланс: {formatMoney(balance)}</span>
                      <span className={styles.profileStats}>
                        Покупок: {stats.orders} • Товаров: {stats.items} • Потрачено:{' '}
                        {formatMoney(stats.spent)}
                      </span>
                    </div>
                  </div>
                </Link>
                <Link to="/balance" className={styles.topUp}>
                  Баланс
                </Link>
                <button type="button" className={styles.logoutButton} onClick={logout}>
                  Выйти
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.authButton}>
                Войти
              </Link>
            )}

            <button className={styles.menuButton} type="button">
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
