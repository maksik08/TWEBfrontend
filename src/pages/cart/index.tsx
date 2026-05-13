import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCartStore, selectCartCount, selectCartSubtotal } from '@/entities/cart/model/cart.store'
import { useSessionStore } from '@/entities/session/model/session.store'
import { getProductImageUrl } from '@/entities/product/model/product.helpers'
import { useLanguage } from '@/shared/i18n'
import styles from './cart.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

export default function CartPage() {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)
  const sessionUser = useSessionStore((s) => s.user)
  const balance = sessionUser?.balance ?? 0

  const count = useMemo(() => selectCartCount(items), [items])
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])
  const hasEnoughBalance = subtotal <= balance

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t({ ru: 'Корзина', en: 'Cart' })}</h1>
          <span className={styles.muted}>{t({ ru: 'Позиций:', en: 'Items:' })} {count}</span>
        </div>

        <div className={styles.layout}>
          <div className={styles.mainColumn}>
            {items.length === 0 ? (
              <p className={styles.muted}>{t({ ru: 'Корзина пуста.', en: 'Cart is empty.' })}</p>
            ) : (
              <div className={styles.list}>
                {items.map((item) => (
                  <div key={item.product.id} className={styles.card}>
                    <div className={styles.thumb}>
                      <img src={getProductImageUrl(item.product)} alt={item.product.title} />
                    </div>

                    <div>
                      <div className={styles.name}>{item.product.title || item.product.name}</div>
                      <div className={styles.meta}>
                        <span>{t({ ru: 'Категория:', en: 'Category:' })} {item.product.category}</span>
                        <span>{t({ ru: 'За шт.:', en: 'Per unit:' })} {formatMoney(item.product.price)}</span>
                      </div>
                    </div>

                    <div className={styles.right}>
                      <div className={styles.price}>
                        {formatMoney(item.quantity * item.product.price)}
                      </div>

                      <div className={styles.qty}>
                        <button
                          className={styles.qtyButton}
                          onClick={() => setQuantity(item.product.id, item.quantity - 1)}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className={styles.qtyValue}>{item.quantity}</span>
                        <button
                          className={styles.qtyButton}
                          onClick={() => setQuantity(item.product.id, item.quantity + 1)}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button className={styles.remove} onClick={() => remove(item.product.id)}>
                        {t({ ru: 'Удалить', en: 'Remove' })}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Сумма товаров', en: 'Subtotal' })}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>{t({ ru: 'Итого', en: 'Total' })}</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>{t({ ru: 'Баланс', en: 'Balance' })}</span>
              <span className={hasEnoughBalance ? styles.balanceOk : styles.balanceLow}>
                {formatMoney(balance)}
              </span>
            </div>

            {items.length > 0 && !hasEnoughBalance && (
              <p className={styles.balanceHint}>
                {t({ ru: 'Недостаточно средств.', en: 'Insufficient funds.' })}{' '}
                <Link to="/balance">{t({ ru: 'Пополнить баланс', en: 'Top up balance' })}</Link>
              </p>
            )}

            <button
              className={styles.pay}
              disabled={items.length === 0}
              onClick={() => navigate('/checkout')}
            >
              {t({ ru: 'Перейти к оформлению', en: 'Proceed to checkout' })}
            </button>

            {items.length > 0 && (
              <button
                className={styles.remove}
                onClick={() => clear()}
                style={{ marginTop: '0.75rem' }}
              >
                {t({ ru: 'Очистить корзину', en: 'Clear cart' })}
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
