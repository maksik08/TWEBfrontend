import { useState } from 'react'
import toast from 'react-hot-toast'
import { useProfileStore } from '@/entities/user/model/profile.store'
import styles from './balance.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

const quickAmounts = [10, 25, 50, 100]

export default function BalancePage() {
  const balance = useProfileStore((s) => s.balance)
  const stats = useProfileStore((s) => s.stats)
  const purchaseHistory = useProfileStore((s) => s.purchaseHistory)
  const topUp = useProfileStore((s) => s.topUp)

  const [amount, setAmount] = useState<number>(25)

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>Пополнение баланса</h1>
          <p className={styles.subtitle}>
            Баланс используется для оплаты заказов. Пополните его любым удобным способом.
          </p>
        </div>

        <div className={styles.layout}>
          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Ваш баланс</h2>
            <div className={styles.balanceValue}>{formatMoney(balance)}</div>

            <div className={styles.stats}>
              <div className={styles.statItem}>
                <span>Покупок</span>
                <strong>{stats.orders}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Товаров</span>
                <strong>{stats.items}</strong>
              </div>
              <div className={styles.statItem}>
                <span>Потрачено</span>
                <strong>{formatMoney(stats.spent)}</strong>
              </div>
            </div>

            {stats.lastPurchaseAt && (
              <p className={styles.lastPurchase}>
                Последняя покупка: {formatDate(stats.lastPurchaseAt)}
              </p>
            )}
          </section>

          <section className={styles.card}>
            <h2 className={styles.sectionTitle}>Пополнить</h2>
            <form
              className={styles.form}
              onSubmit={(event) => {
                event.preventDefault()
                if (!Number.isFinite(amount) || amount <= 0) {
                  toast.error('Введите корректную сумму')
                  return
                }

                topUp(amount)
                toast.success(`Баланс пополнен на ${formatMoney(amount)}`)
                setAmount(0)
              }}
            >
              <label className={styles.label} htmlFor="balance-amount">
                Сумма
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
                <button className={styles.submit} type="submit">
                  Пополнить
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

            <p className={styles.note}>Средства начисляются мгновенно (демо).</p>
          </section>
        </div>

        <section className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2 className={styles.sectionTitle}>История покупок</h2>
            <span className={styles.historyCount}>Всего заказов: {purchaseHistory.length}</span>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className={styles.emptyHistory}>
              История пока пустая. После оплаты в корзине здесь появятся ваши покупки.
            </div>
          ) : (
            <div className={styles.historyList}>
              {purchaseHistory.map((entry) => (
                <article key={entry.id} className={styles.historyCard}>
                  <div className={styles.historyTop}>
                    <div>
                      <h3 className={styles.historyTitle}>Заказ на {formatMoney(entry.total)}</h3>
                      <p className={styles.historyDate}>{formatDate(entry.purchasedAt)}</p>
                    </div>
                    <div className={styles.historyMeta}>
                      <span>{entry.itemsCount} шт.</span>
                      <strong>{formatMoney(entry.total)}</strong>
                    </div>
                  </div>

                  <div className={styles.historyLines}>
                    {entry.lines.map((line) => (
                      <div key={`${entry.id}-${line.productId}`} className={styles.historyLine}>
                        <span>{line.title}</span>
                        <span>
                          {line.quantity} x {formatMoney(line.unitPrice)}
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
