import { useMemo, useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import { fetchActionLogs, type ActionLogDto } from '@/entities/action-log/api/action-log.api'
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

export const AdminLogsTab = () => {
  const [query, setQuery] = useState('')

  const { data: logs = [], isLoading, isError, error } = useQuery<ActionLogDto[]>({
    queryKey: ['admin', 'action-logs'],
    queryFn: () => fetchActionLogs(),
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return logs
    return logs.filter((log) => {
      const text = `${log.actorUserName ?? ''} ${log.actorRole} ${log.action} ${log.entityType} ${log.entityId ?? ''} ${log.details ?? ''}`.toLowerCase()
      return text.includes(q)
    })
  }, [logs, query])

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Логи действий</h2>
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
            <h2 className={styles.cardTitle}>Логи действий</h2>
          </div>
          <p>{extractMessage(error, 'Не удалось загрузить логи')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Логи действий</h2>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Поиск</span>
            <input
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пользователь / действие / сущность / детали"
            />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Записей (последние 100)</span>
            <div style={{ padding: '0.5rem 0' }}>{filtered.length}</div>
          </div>
        </div>

        <div className={styles.subSection}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--color-text-muted, #6b7280)' }}>
                  <th style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>Время</th>
                  <th style={{ padding: '0.5rem' }}>Пользователь</th>
                  <th style={{ padding: '0.5rem' }}>Действие</th>
                  <th style={{ padding: '0.5rem' }}>Объект</th>
                  <th style={{ padding: '0.5rem' }}>Детали</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: '1rem', color: 'var(--color-text-muted, #6b7280)' }}>
                      Нет записей
                    </td>
                  </tr>
                ) : (
                  filtered.map((log) => (
                    <tr key={log.id} style={{ borderTop: '1px solid var(--color-border, #e5e7eb)' }}>
                      <td style={{ padding: '0.5rem', whiteSpace: 'nowrap' }}>{formatDateTime(log.createdAt)}</td>
                      <td style={{ padding: '0.5rem' }}>
                        {log.actorUserName ?? '—'}
                        <span style={{ color: 'var(--color-text-muted, #6b7280)' }}> · {log.actorRole}</span>
                      </td>
                      <td style={{ padding: '0.5rem', fontWeight: 600 }}>{log.action}</td>
                      <td style={{ padding: '0.5rem' }}>
                        {log.entityType}
                        {log.entityId != null && <span> #{log.entityId}</span>}
                      </td>
                      <td style={{ padding: '0.5rem', color: 'var(--color-text-muted, #6b7280)' }}>
                        {log.details ?? '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
