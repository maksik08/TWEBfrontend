import { useState } from 'react'
import toast from 'react-hot-toast'
import { useProfileStore } from '@/entities/user/model/profile.store'
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
  const balance = useProfileStore((s) => s.balance)
  const stats = useProfileStore((s) => s.stats)
  const purchaseHistory = useProfileStore((s) => s.purchaseHistory)
  const topUp = useProfileStore((s) => s.topUp)

  const { t } = useLanguage()
  const [amount, setAmount] = useState<number>(25)

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
                <strong>{stats.orders}</strong>
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
                if (!Number.isFinite(amount) || amount <= 0) {
                  toast.error(t({ ru: 'Введите корректную сумму', en: 'Enter a valid amount' }))
                  return
                }

                topUp(amount)
                toast.success(`${t({ ru: 'Баланс пополнен на', en: 'Balance topped up by' })} ${formatMoney(amount)}`)
                setAmount(0)
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
                <button className={styles.submit} type="submit">
                  {t({ ru: 'Пополнить', en: 'Top up' })}
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
            <span className={styles.historyCount}>{t({ ru: 'Всего заказов:', en: 'Total orders:' })} {purchaseHistory.length}</span>
          </div>

          {purchaseHistory.length === 0 ? (
            <div className={styles.emptyHistory}>
              {t({ ru: 'История пока пустая. После оплаты в корзине здесь появятся ваши покупки.', en: 'History is empty. After paying in the cart, your purchases will appear here.' })}
            </div>
          ) : (
            <div className={styles.historyList}>
              {purchaseHistory.map((entry) => (
                <article key={entry.id} className={styles.historyCard}>
                  <div className={styles.historyTop}>
                    <div>
                      <h3 className={styles.historyTitle}>{t({ ru: 'Заказ на', en: 'Order for' })} {formatMoney(entry.total)}</h3>
                      <p className={styles.historyDate}>{formatDate(entry.purchasedAt)}</p>
                    </div>
                    <div className={styles.historyMeta}>
                      <span>{entry.itemsCount} {t({ ru: 'шт.', en: 'pcs.' })}</span>
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
