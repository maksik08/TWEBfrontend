import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useSessionStore } from '@/entities/session/model/session.store'
import { fetchMyOrders, cancelOrder, type Order } from '@/entities/order'
import { useLanguage } from '@/shared/i18n'
import styles from './orders.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export default function OrdersPage() {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const isBootstrapped = useSessionStore((s) => s.isBootstrapped)
  const { t } = useLanguage()

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchMyOrders()
      .then((data) => {
        if (cancelled) return
        setOrders(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : t({ ru: 'Не удалось загрузить заказы', en: 'Failed to load orders' })
        setError(message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [isAuthenticated, isBootstrapped, t])

  if (isBootstrapped && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const handleCancel = async (orderId: number) => {
    setCancellingId(orderId)
    try {
      const updated = await cancelOrder(orderId)
      setOrders((prev) => prev.map((order) => (order.id === orderId ? updated : order)))
      toast.success(t({ ru: 'Заказ отменён', en: 'Order cancelled' }))
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : t({ ru: 'Не удалось отменить заказ', en: 'Failed to cancel order' })
      toast.error(message)
    } finally {
      setCancellingId(null)
    }
  }

  const statusLabel = (status: Order['status']) => {
    switch (status) {
      case 'Pending':
        return t({ ru: 'Ожидает', en: 'Pending' })
      case 'Paid':
        return t({ ru: 'Оплачен', en: 'Paid' })
      case 'Shipped':
        return t({ ru: 'Отправлен', en: 'Shipped' })
      case 'Completed':
        return t({ ru: 'Завершён', en: 'Completed' })
      case 'Cancelled':
        return t({ ru: 'Отменён', en: 'Cancelled' })
      default:
        return status
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>{t({ ru: 'Мои заказы', en: 'My orders' })}</h1>
            <p className={styles.subtitle}>
              {t({
                ru: 'История покупок, синхронизированная с сервером.',
                en: 'Purchase history synchronized with the server.',
              })}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>{t({ ru: 'Загрузка…', en: 'Loading…' })}</div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            {t({
              ru: 'У вас пока нет заказов. Соберите корзину и оформите первую покупку.',
              en: "You don't have any orders yet. Build a cart and place your first one.",
            })}
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => {
              const statusClass = styles[`status_${order.status}`] ?? ''
              const canCancel = order.status === 'Pending' || order.status === 'Paid'

              return (
                <article key={order.id} className={styles.card}>
                  <header className={styles.cardHeader}>
                    <div>
                      <div className={styles.cardTitle}>
                        {t({ ru: 'Заказ', en: 'Order' })} #{order.id}
                      </div>
                      <div className={styles.meta}>
                        {formatDate(order.createdAt)}
                        {order.paidAt
                          ? ` · ${t({ ru: 'оплачен', en: 'paid' })} ${formatDate(order.paidAt)}`
                          : ''}
                      </div>
                    </div>
                    <span className={`${styles.status} ${statusClass}`}>{statusLabel(order.status)}</span>
                  </header>

                  <div className={styles.items}>
                    {order.items.map((item) => (
                      <div key={item.id} className={styles.itemRow}>
                        <span className={styles.itemName}>{item.productName}</span>
                        <span className={styles.itemMeta}>
                          {item.quantity} × {formatMoney(item.unitPrice)} = {formatMoney(item.lineTotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  <footer className={styles.footer}>
                    <span className={styles.total}>
                      {t({ ru: 'Итого', en: 'Total' })}: {formatMoney(order.subtotal)}
                    </span>
                    {canCancel && (
                      <button
                        type="button"
                        className={styles.cancelButton}
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancel(order.id)}
                      >
                        {cancellingId === order.id
                          ? t({ ru: 'Отмена…', en: 'Cancelling…' })
                          : t({ ru: 'Отменить', en: 'Cancel' })}
                      </button>
                    )}
                  </footer>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
