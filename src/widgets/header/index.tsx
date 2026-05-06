import { Link } from 'react-router-dom'
import { FiHeart, FiMenu, FiMoon, FiShoppingCart, FiSun } from 'react-icons/fi'
import { useCartStore, selectCartCount } from '@/entities/cart/model/cart.store'
import { useFavoritesStore } from '@/entities/favorites/model/favorites.store'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useThemeStore } from '@/entities/theme/model/theme.store'
import { useLanguage } from '@/shared/i18n'
import styles from './header.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

export const Header = () => {
  const { language, setLanguage, t } = useLanguage()
  const cartCount = useCartStore((state) => selectCartCount(state.items))
  const totalLikes = useFavoritesStore((state) =>
    Object.values(state.likes).reduce((sum, value) => sum + value, 0),
  )
  const isAuthenticated = useSessionStore((state) => state.isAuthenticated)
  const sessionUser = useSessionStore((state) => state.user)
  const logout = useSessionStore((state) => state.logout)

  const firstName = sessionUser?.firstName ?? ''
  const lastName = sessionUser?.lastName ?? ''
  const balance = sessionUser?.balance ?? 0

  const theme = useThemeStore((state) => state.theme)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)

  const displayName = sessionUser?.username ?? `${firstName} ${lastName}`.trim()
  const displayMeta =
    sessionUser?.email ??
    t({
      ru: 'Личный кабинет',
      en: 'Personal account',
    })
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
              {t({ ru: 'Каталог', en: 'Catalog' })}
            </Link>
            <Link to="/favorites" className={styles.navLink}>
              {t({ ru: 'Избранное', en: 'Favorites' })}
            </Link>
            <Link to="/about" className={styles.navLink}>
              {t({ ru: 'О нас', en: 'About' })}
            </Link>
          </nav>

          <div className={styles.actions}>
            <div className={styles.languageSwitch} role="group" aria-label="Language switch">
              <button
                type="button"
                className={`${styles.languageButton} ${
                  language === 'ru' ? styles.languageButtonActive : ''
                }`}
                onClick={() => setLanguage('ru')}
              >
                RU
              </button>
              <button
                type="button"
                className={`${styles.languageButton} ${
                  language === 'en' ? styles.languageButtonActive : ''
                }`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              className={styles.themeButton}
              onClick={toggleTheme}
              aria-label={
                theme === 'light'
                  ? t({ ru: 'Включить тёмную тему', en: 'Enable dark theme' })
                  : t({ ru: 'Включить светлую тему', en: 'Enable light theme' })
              }
              title={
                theme === 'light'
                  ? t({ ru: 'Тёмная тема', en: 'Dark theme' })
                  : t({ ru: 'Светлая тема', en: 'Light theme' })
              }
            >
              {theme === 'light' ? <FiMoon size={20} /> : <FiSun size={20} />}
            </button>

            <Link
              to="/catalog?section=equipment&sort=likes"
              className={styles.iconButton}
              aria-label={t({ ru: 'Популярные товары', en: 'Popular products' })}
              title={t({
                ru: 'Показать самые лайкнутые товары',
                en: 'Show the most liked products',
              })}
            >
              <FiHeart size={20} />
              {totalLikes > 0 && <span className={styles.likesBadge}>{totalLikes}</span>}
            </Link>

            <Link
              to="/cart"
              className={styles.iconButton}
              aria-label={t({ ru: 'Корзина', en: 'Cart' })}
            >
              <FiShoppingCart size={20} />
              <span className={styles.cartBadge}>{cartCount}</span>
            </Link>

            {isAuthenticated ? (
              <div className={styles.profileCard}>
                <Link to="/profile" className={styles.profileLink}>
                  <div className={styles.avatarFrame} aria-hidden="true">
                    <span className={styles.avatarInitials}>{initials || 'U'}</span>
                  </div>
                  <div className={styles.profileInfo}>
                    <div className={styles.profileName}>{displayName}</div>
                    <div className={styles.profileMeta}>
                      <span>{displayMeta}</span>
                      <span className={styles.profileBalance}>
                        {t({ ru: 'Баланс', en: 'Balance' })}: {formatMoney(balance)}
                      </span>
                    </div>
                  </div>
                </Link>
                <Link to="/orders" className={styles.topUp}>
                  {t({ ru: 'Заказы', en: 'Orders' })}
                </Link>
                <Link to="/balance" className={styles.topUp}>
                  {t({ ru: 'Баланс', en: 'Balance' })}
                </Link>
                <button type="button" className={styles.logoutButton} onClick={logout}>
                  {t({ ru: 'Выйти', en: 'Log out' })}
                </button>
              </div>
            ) : (
              <Link to="/login" className={styles.authButton}>
                {t({ ru: 'Войти', en: 'Log in' })}
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
