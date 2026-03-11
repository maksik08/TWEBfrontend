import { Link } from 'react-router-dom';
import { FiShoppingCart, FiHeart, FiMenu } from 'react-icons/fi';
import styles from './header.module.css';
import { useCartStore, selectCartCount } from '@/entities/cart/model/cart.store'

export const Header = () => {
  const cartCount = useCartStore((s) => selectCartCount(s.items))

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
            <Link to="/" className={styles.navLink}>
              О нас
            </Link>
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconButton}>
              <FiHeart size={20} />
            </button>
            <Link to="/cart" className={styles.iconButton} aria-label="Cart">
              <FiShoppingCart size={20} />
              <span className={styles.cartBadge}>{cartCount}</span>
            </Link>
            <button className={styles.menuButton}>
              <FiMenu size={24} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header
