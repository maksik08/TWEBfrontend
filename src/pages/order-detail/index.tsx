import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useSessionStore } from '@/entities/session/model/session.store'
import { cancelOrder, fetchOrderById, payOrder, type Order } from '@/entities/order'
import { useLanguage } from '@/shared/i18n'
import styles from './order-detail.module.css'

const formatMoney = (value: number) => `$${value.toFixed(2)}`
const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const parsedId = orderId ? Number.parseInt(orderId, 10) : NaN
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated)
  const isBootstrapped = useSessionStore((s) => s.isBootstrapped)
  const { t } = useLanguage()

  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<'pay' | 'cancel' | null>(null)

  useEffect(() => {
    if (isBootstrapped && !isAuthenticated) return
    if (!Number.isFinite(parsedId)) return

    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchOrderById(parsedId)
      .then((data) => {
        if (!cancelled) setOrder(data)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : t({ ru: 'Не удалось загрузить заказ', en: 'Failed to load order' })
        setError(message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [parsedId, isAuthenticated, isBootstrapped, t])

  if (isBootstrapped && !isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!Number.isFinite(parsedId)) {
    return <Navigate to="/orders" replace />
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

  const handlePay = async () => {
    if (!order) return
    setPendingAction('pay')
    try {
      const updated = await payOrder(order.id)
      setOrder(updated)
      toast.success(t({ ru: 'Заказ оплачен', en: 'Order paid' }))
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : t({ ru: 'Не удалось оплатить заказ', en: 'Payment failed' })
      toast.error(message)
    } finally {
      setPendingAction(null)
    }
  }

  const handleCancel = async () => {
    if (!order) return
    setPendingAction('cancel')
    try {
      const updated = await cancelOrder(order.id)
      setOrder(updated)
      toast.success(t({ ru: 'Заказ отменён', en: 'Order cancelled' }))
    } catch (err) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? err.response.data.message
          : t({ ru: 'Не удалось отменить заказ', en: 'Failed to cancel order' })
      toast.error(message)
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <div className={styles.page}>
      <div className="container">
        <Link to="/orders" className={styles.backLink}>
          ← {t({ ru: 'К моим заказам', en: 'Back to my orders' })}
        </Link>

        {isLoading ? (
          <div className={styles.loading}>{t({ ru: 'Загрузка…', en: 'Loading…' })}</div>
        ) : error ? (
          <div className={styles.errorBox}>{error}</div>
        ) : !order ? (
          <div className={styles.empty}>{t({ ru: 'Заказ не найден', en: 'Order not found' })}</div>
        ) : (
          <>
            <div className={styles.header}>
              <div>
                <h1 className={styles.title}>
                  {t({ ru: 'Заказ', en: 'Order' })} #{order.id}
                </h1>
                <div className={styles.meta}>
                  {t({ ru: 'Создан', en: 'Created' })}: {formatDate(order.createdAt)}
                </div>
              </div>
              <span className={`${styles.status} ${styles[`status_${order.status}`] ?? ''}`}>
                {statusLabel(order.status)}
              </span>
            </div>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>{t({ ru: 'Сводка', en: 'Summary' })}</h2>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{t({ ru: 'Статус', en: 'Status' })}</span>
                  <span className={styles.summaryValue}>{statusLabel(order.status)}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{t({ ru: 'Позиций', en: 'Items' })}</span>
                  <span className={styles.summaryValue}>{order.items.length}</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>{t({ ru: 'Создан', en: 'Created at' })}</span>
                  <span className={styles.summaryValue}>{formatDate(order.createdAt)}</span>
                </div>
                {order.paidAt && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{t({ ru: 'Оплачен', en: 'Paid at' })}</span>
                    <span className={styles.summaryValue}>{formatDate(order.paidAt)}</span>
                  </div>
                )}
                {order.userName && (
                  <div className={styles.summaryRow}>
                    <span className={styles.summaryLabel}>{t({ ru: 'Покупатель', en: 'Customer' })}</span>
                    <span className={styles.summaryValue}>{order.userName}</span>
                  </div>
                )}
              </div>
            </section>

            <section className={styles.card}>
              <h2 className={styles.sectionTitle}>{t({ ru: 'Позиции', en: 'Items' })}</h2>
              <table className={styles.itemsTable}>
                <thead>
                  <tr>
                    <th>{t({ ru: 'Товар', en: 'Product' })}</th>
                    <th className={styles.num}>{t({ ru: 'Кол-во', en: 'Qty' })}</th>
                    <th className={styles.num}>{t({ ru: 'Цена', en: 'Price' })}</th>
                    <th className={styles.num}>{t({ ru: 'Сумма', en: 'Total' })}</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/catalog/${item.productId}`}>{item.productName}</Link>
                      </td>
                      <td className={styles.num}>{item.quantity}</td>
                      <td className={styles.num}>{formatMoney(item.unitPrice)}</td>
                      <td className={styles.num}>{formatMoney(item.lineTotal)}</td>
                    </tr>
                  ))}
                  <tr className={styles.totalRow}>
                    <td colSpan={3}>{t({ ru: 'Итого', en: 'Total' })}</td>
                    <td className={styles.num}>{formatMoney(order.subtotal)}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {(order.status === 'Pending' || order.status === 'Paid') && (
              <section className={styles.card}>
                <h2 className={styles.sectionTitle}>{t({ ru: 'Действия', en: 'Actions' })}</h2>
                <div className={styles.actions}>
                  {order.status === 'Pending' && (
                    <button
                      type="button"
                      className={`${styles.button} ${styles.primary}`}
                      onClick={handlePay}
                      disabled={pendingAction !== null}
                    >
                      {pendingAction === 'pay'
                        ? t({ ru: 'Оплачиваем…', en: 'Paying…' })
                        : t({ ru: 'Оплатить', en: 'Pay' })}
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.button} ${styles.danger}`}
                    onClick={handleCancel}
                    disabled={pendingAction !== null}
                  >
                    {pendingAction === 'cancel'
                      ? t({ ru: 'Отмена…', en: 'Cancelling…' })
                      : t({ ru: 'Отменить', en: 'Cancel order' })}
                  </button>
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  )
}
