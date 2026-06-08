import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchContactMessages,
  updateContactMessageStatus,
  type ContactMessageDto,
  type ContactMessageStatus,
} from '@/entities/contact-message/api/contact-message.api'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

const formatDateTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

const STATUS_OPTIONS: { value: ContactMessageStatus; label: string }[] = [
  { value: 'New', label: 'Новое' },
  { value: 'InProgress', label: 'В работе' },
  { value: 'Resolved', label: 'Решено' },
]

const STATUS_STYLES: Record<ContactMessageStatus, { color: string; background: string }> = {
  New: { color: '#1d4ed8', background: '#dbeafe' },
  InProgress: { color: '#b45309', background: '#fef3c7' },
  Resolved: { color: '#15803d', background: '#dcfce7' },
}

const STATUS_FILTERS: { value: ContactMessageStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  ...STATUS_OPTIONS,
]

export const AdminMessagesTab = () => {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContactMessageStatus | 'all'>('all')

  const { data: messages = [], isLoading, isError, error } = useQuery<ContactMessageDto[]>({
    queryKey: ['admin', 'contact-messages'],
    queryFn: fetchContactMessages,
  })

  const statusMutation = useMutation({
    mutationFn: (vars: { id: number; status: ContactMessageStatus }) =>
      updateContactMessageStatus(vars.id, vars.status),
    onSuccess: async () => {
      toast.success('Статус обновлён')
      await queryClient.invalidateQueries({ queryKey: ['admin', 'contact-messages'] })
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось обновить статус')),
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return messages.filter((m) => {
      if (statusFilter !== 'all' && m.status !== statusFilter) return false
      if (!q) return true
      const text = `${m.name} ${m.email} ${m.subject} ${m.message}`.toLowerCase()
      return text.includes(q)
    })
  }, [messages, query, statusFilter])

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Обращения</h2>
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
            <h2 className={styles.cardTitle}>Обращения</h2>
          </div>
          <p>{extractMessage(error, 'Не удалось загрузить обращения')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Обращения</h2>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Поиск</span>
            <input
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Имя / email / тема / текст"
            />
          </label>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Статус</span>
            <select
              className={styles.input}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ContactMessageStatus | 'all')}
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
          <div className={styles.itemList}>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>Нет обращений</p>
            ) : (
              filtered.map((m) => {
                const pending = statusMutation.isPending && statusMutation.variables?.id === m.id
                const badge = STATUS_STYLES[m.status]
                return (
                  <div key={m.id} className={styles.itemRow}>
                    <div className={styles.itemRowHeader}>
                      <span className={styles.itemIndex}>
                        #{m.id} · {formatDateTime(m.createdAt)}
                      </span>
                      <span
                        style={{
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          padding: '0.25rem 0.625rem',
                          borderRadius: 999,
                          color: badge.color,
                          background: badge.background,
                        }}
                      >
                        {STATUS_OPTIONS.find((o) => o.value === m.status)?.label ?? m.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>{m.subject}</div>
                    <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {m.name} · {m.email}
                      {m.userName && <span> · аккаунт: {m.userName}</span>}
                    </div>
                    <p style={{ margin: '0 0 0.75rem', whiteSpace: 'pre-wrap' }}>{m.message}</p>

                    <div className={styles.actionRow}>
                      {STATUS_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={m.status === option.value ? styles.btnPrimary : styles.btnSecondary}
                          onClick={() => statusMutation.mutate({ id: m.id, status: option.value })}
                          disabled={pending || m.status === option.value}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
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
