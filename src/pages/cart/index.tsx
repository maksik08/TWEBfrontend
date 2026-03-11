import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useCartStore, selectCartCount, selectCartSubtotal } from '@/entities/cart/model/cart.store'
import styles from './cart.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`

export default function CartPage() {
  const items = useCartStore((s) => s.items)
  const setQuantity = useCartStore((s) => s.setQuantity)
  const remove = useCartStore((s) => s.remove)
  const clear = useCartStore((s) => s.clear)

  const [discount, setDiscount] = useState<number>(0)

  const count = useMemo(() => selectCartCount(items), [items])
  const subtotal = useMemo(() => selectCartSubtotal(items), [items])
  const total = Math.max(0, subtotal - Math.max(0, discount))

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.titleRow}>
          <h1 className={styles.title}>Cart</h1>
          <span className={styles.muted}>Items: {count}</span>
        </div>

        <div className={styles.layout}>
          <div>
            {items.length === 0 ? (
              <p className={styles.muted}>Cart is empty.</p>
            ) : (
              <div className={styles.list}>
                {items.map((item) => (
                  <div key={item.product.id} className={styles.card}>
                    <div className={styles.thumb}>
                      <img src={item.product.image} alt={item.product.title} />
                    </div>

                    <div>
                      <div className={styles.name}>{item.product.title || item.product.name}</div>
                      <div className={styles.meta}>
                        <span>Category: {item.product.category}</span>
                        <span>Unit: {formatMoney(item.product.price)}</span>
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
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.row}>
              <span className={styles.muted}>Subtotal</span>
              <span>{formatMoney(subtotal)}</span>
            </div>

            <div className={styles.row}>
              <span className={styles.muted}>Discount</span>
              <input
                className={styles.input}
                type="number"
                min={0}
                step={1}
                value={Number.isFinite(discount) ? discount : 0}
                onChange={(e) => setDiscount(Number(e.target.value))}
              />
            </div>

            <div className={`${styles.row} ${styles.totalRow}`}>
              <span>Total</span>
              <span>{formatMoney(total)}</span>
            </div>

            <button
              className={styles.pay}
              disabled={items.length === 0}
              onClick={() => {
                toast.success(`Paid ${formatMoney(total)} (demo)`)
                clear()
                setDiscount(0)
              }}
            >
              Pay
            </button>

            {items.length > 0 && (
              <button
                className={styles.remove}
                onClick={() => {
                  clear()
                  setDiscount(0)
                }}
                style={{ marginTop: '0.75rem' }}
              >
                Clear cart
              </button>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}
