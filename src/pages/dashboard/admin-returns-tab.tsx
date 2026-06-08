import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  approveReturn,
  createReturn,
  fetchReturns,
  rejectReturn,
  type ReturnDto,
  type ReturnStatus,
} from '@/entities/return/api/return.api'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

const formatMoney = (value: number) => `$${value.toFixed(2)}`

const formatDateTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

const STATUS_META: Record<ReturnStatus, { label: string; color: string; background: string }> = {
  Requested: { label: 'Запрошен', color: '#b45309', background: '#fef3c7' },
  Approved: { label: 'Одобрен', color: '#15803d', background: '#dcfce7' },
  Rejected: { label: 'Отклонён', color: '#b91c1c', background: '#fee2e2' },
}

const STATUS_FILTERS: { value: ReturnStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'Requested', label: 'Запрошенные' },
  { value: 'Approved', label: 'Одобренные' },
  { value: 'Rejected', label: 'Отклонённые' },
]

export const AdminReturnsTab = () => {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<ReturnStatus | 'all'>('all')
  const [orderId, setOrderId] = useState('')
  const [reason, setReason] = useState('')

  const { data: returns = [], isLoading, isError, error } = useQuery<ReturnDto[]>({
    queryKey: ['admin', 'returns'],
    queryFn: fetchReturns,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'returns'] })

  const createMutation = useMutation({
    mutationFn: (payload: { orderId: number; reason: string }) => createReturn(payload),
    onSuccess: async () => {
      toast.success('Возврат инициирован')
      setOrderId('')
      setReason('')
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось инициировать возврат')),
  })

  const approveMutation = useMutation({
    mutationFn: (id: number) => approveReturn(id),
    onSuccess: async () => {
      toast.success('Возврат одобрен, средства возвращены')
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось одобрить возврат')),
  })

  const rejectMutation = useMutation({
    mutationFn: (id: number) => rejectReturn(id),
    onSuccess: async () => {
      toast.success('Возврат отклонён')
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось отклонить возврат')),
  })

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return returns
    return returns.filter((r) => r.status === statusFilter)
  }, [returns, statusFilter])

  const submitCreate = () => {
    const id = Number(orderId)
    if (!Number.isInteger(id) || id <= 0) {
      toast.error('Укажите корректный ID заказа')
      return
    }
    if (reason.trim().length < 5) {
      toast.error('Причина должна содержать минимум 5 символов')
      return
    }
    createMutation.mutate({ orderId: id, reason: reason.trim() })
  }

  const busy = approveMutation.isPending || rejectMutation.isPending

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Возвраты</h2>
          </div>
          <p>Загрузка…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Возвраты</h2>
          </div>
          <p>{extractMessage(error, 'Не удалось загрузить возвраты')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Возвраты</h2>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Инициировать возврат</p>
          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>ID заказа</span>
              <input
                className={styles.input}
                type="number"
                min="1"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="например, 42"
              />
            </label>
            <label className={styles.field} style={{ gridColumn: '1 / -1' }}>
              <span className={styles.fieldLabel}>Причина</span>
              <textarea
                className={styles.textarea}
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Причина возврата (минимум 5 символов)"
              />
            </label>
          </div>
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.btnPrimary}
              onClick={submitCreate}
              disabled={createMutation.isPending}
            >
              Инициировать
            </button>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Статус</span>
            <select
              className={styles.input}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ReturnStatus | 'all')}
            >
              {STATUS_FILTERS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Найдено</span>
            <div style={{ padding: '0.5rem 0' }}>{filtered.length}</div>
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Список</p>
          <div className={styles.itemList}>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>Нет возвратов</p>
            ) : (
              filtered.map((r) => {
                const meta = STATUS_META[r.status]
                const pending =
                  (approveMutation.isPending && approveMutation.variables === r.id) ||
                  (rejectMutation.isPending && rejectMutation.variables === r.id)
                return (
                  <div key={r.id} className={styles.itemRow}>
                    <div className={styles.itemRowHeader}>
                      <span className={styles.itemIndex}>
                        Возврат #{r.id} · заказ #{r.orderId} · {formatDateTime(r.createdAt)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.625rem',
                          borderRadius: 999,
                          color: meta.color,
                          background: meta.background,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>
                      {formatMoney(r.amount)}
                      {r.userName && (
                        <span style={{ color: 'var(--color-text-muted, #6b7280)', fontWeight: 400 }}>
                          {' '}· {r.userName}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: '0 0 0.5rem', whiteSpace: 'pre-wrap' }}>{r.reason}</p>
                    {r.resolution && (
                      <p style={{ margin: '0 0 0.5rem', color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
                        Резолюция: {r.resolution}
                      </p>
                    )}
                    {r.status === 'Requested' && (
                      <div className={styles.actionRow}>
                        <button
                          type="button"
                          className={styles.btnPrimary}
                          onClick={() => approveMutation.mutate(r.id)}
                          disabled={busy || pending}
                        >
                          Одобрить и вернуть средства
                        </button>
                        <button
                          type="button"
                          className={styles.btnDanger}
                          onClick={() => rejectMutation.mutate(r.id)}
                          disabled={busy || pending}
                        >
                          Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
