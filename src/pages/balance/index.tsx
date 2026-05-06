import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useSessionStore } from '@/entities/session/model/session.store'
import { topUpBalance } from '@/entities/user/api/profile.api'
import { fetchMyOrders, type Order } from '@/entities/order'
import { useLanguage } from '@/shared/i18n'
import styles from './balance.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const quickAmounts = [10, 25, 50, 100]

export default function BalancePage() {
  const user = useSessionStore((s) => s.user)
  const setUser = useSessionStore((s) => s.setUser)
  const balance = user?.balance ?? 0

  const { t } = useLanguage()
  const [amount, setAmount] = useState<number>(25)
  const [isTopping, setIsTopping] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let cancelled = false
    setIsOrdersLoading(true)
    fetchMyOrders()
      .then((data) => {
        if (!cancelled) setOrders(data)
      })
      .catch(() => {
        if (!cancelled) setOrders([])
      })
      .finally(() => {
        if (!cancelled) setIsOrdersLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [user])

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === 'Paid' || o.status === 'Shipped' || o.status === 'Completed')
    const items = paidOrders.reduce(
      (sum, order) => sum + order.items.reduce((s, line) => s + line.quantity, 0),
      0,
    )
    const spent = paidOrders.reduce((sum, order) => sum + order.subtotal, 0)
    const lastPurchaseAt = paidOrders.length > 0
      ? paidOrders.reduce((latest, order) => {
          const ts = order.paidAt ?? order.createdAt
          return ts > latest ? ts : latest
        }, '')
      : null
    return { ordersCount: paidOrders.length, items, spent, lastPurchaseAt }
  }, [orders])

  const handleTopUp = async () => {
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error(t({ ru: 'Введите корректную сумму', en: 'Enter a valid amount' }))
      return
    }
    if (!user) return

    setIsTopping(true)
    try {
      const updated = await topUpBalance(amount)
      setUser(updated)
      toast.success(`${t({ ru: 'Баланс пополнен на', en: 'Balance topped up by' })} ${formatMoney(amount)}`)
      setAmount(0)
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : t({ ru: 'Не удалось пополнить баланс', en: 'Failed to top up balance' })
      toast.error(message)
    } finally {
      setIsTopping(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>{t({ ru: 'Пополнение баланса', en: 'Top up balance' })}</h1>
          <p className={styles.subtitle}>
            {t({ ru: 'Баланс используется для оплаты заказов. Пополните его любым удобным способом.', en: 'Balance is used to pay for orders. Top it up in any convenient way.' })}
          </p>
        </div>

        <div className={styles.layout}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>{t({ ru: 'Ваш баланс', en: 'Your balance' })}</h2>
            <div className={styles.balanceValue}>{formatMoney(balance)}</div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span>{t({ ru: 'Покупок', en: 'Purchases' })}</span>
                <strong>{stats.ordersCount}</strong>
              </div>
              <div className={styles.statItem}>
                <span>{t({ ru: 'Товаров', en: 'Items' })}</span>
                <strong>{stats.items}</strong>
              </div>
              <div className={styles.statItem}>
                <span>{t({ ru: 'Потрачено', en: 'Spent' })}</span>
                <strong>{formatMoney(stats.spent)}</strong>
              </div>
            </div>

            {stats.lastPurchaseAt && (
              <p className={styles.lastPurchase}>
                {t({ ru: 'Последняя покупка:', en: 'Last purchase:' })} {formatDate(stats.lastPurchaseAt)}
              </p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>{t({ ru: 'Пополнить', en: 'Top up' })}</h2>
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault()
                handleTopUp()
              }}
            >
              <label className={styles.label} htmlFor="balance-amount">
                {t({ ru: 'Сумма', en: 'Amount' })}
              </label>
              <div className={styles.inputRow}>
                <input
                  id="balance-amount"
                  className={styles.input}
                  type="number"
                  min={1}
                  step={1}
                  value={Number.isFinite(amount) ? amount : 0}
                  onChange={(e) => setAmount(Number(e.target.value))}
                />
                <button className={styles.submit} type="submit" disabled={isTopping}>
                  {isTopping
                    ? t({ ru: 'Пополнение…', en: 'Topping up…' })
                    : t({ ru: 'Пополнить', en: 'Top up' })}
                </button>
              </div>

              <div className={styles.quickRow}>
                {quickAmounts.map((value) => (
                  <button
                    key={value}
                    className={styles.quickButton}
                    type="button"
                    onClick={() => setAmount(value)}
                  >
                    +{formatMoney(value)}
                  </button>
                ))}
              </div>
            </form>

            <p className={styles.note}>{t({ ru: 'Средства начисляются мгновенно (демо).', en: 'Funds are credited instantly (demo).' })}</p>
          </section>
        </div>

        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>{t({ ru: 'История покупок', en: 'Purchase history' })}</h2>
            <span className={styles.historyCount}>{t({ ru: 'Всего заказов:', en: 'Total orders:' })} {orders.length}</span>
          </div>

          {isOrdersLoading ? (
            <div className={styles.emptyHistory}>{t({ ru: 'Загрузка…', en: 'Loading…' })}</div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyHistory}>
              {t({ ru: 'История пока пустая. После оплаты в корзине здесь появятся ваши покупки.', en: 'History is empty. After paying in the cart, your purchases will appear here.' })}
            </div>
          ) : (
            <div className={styles.historyList}>
              {orders.map((order) => (
                <article key={order.id} className={styles.historyCard}>
                  <div className={styles.historyTop}>
                    <div>
                      <h3 className={styles.historyTitle}>
                        {t({ ru: 'Заказ', en: 'Order' })} #{order.id} — {formatMoney(order.subtotal)}
                      </h3>
                      <p className={styles.historyDate}>{formatDate(order.paidAt ?? order.createdAt)}</p>
                    </div>
                    <div className={styles.historyMeta}>
                      <span>{order.items.reduce((s, l) => s + l.quantity, 0)} {t({ ru: 'шт.', en: 'pcs.' })}</span>
                      <strong>{formatMoney(order.subtotal)}</strong>
                    </div>
                  </div>

                  <div className={styles.historyLines}>
                    {order.items.map((item) => (
                      <div key={item.id} className={styles.historyLine}>
                        <span>{item.productName}</span>
                        <span>
                          {item.quantity} x {formatMoney(item.unitPrice)}
                        </span>
                      </div>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
