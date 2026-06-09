import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  assignSupportTicket,
  fetchAllSupportTickets,
  fetchSupportTicket,
  postSupportMessage,
  updateSupportTicketStatus,
  SUPPORT_STATUS_LABELS,
  type SupportTicketDto,
  type SupportTicketStatus,
} from '@/entities/support/api/support.api'
import { useSessionStore } from '@/entities/session/model/session.store'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

const formatDateTime = (v: string) => new Date(v).toLocaleString('ru-RU')

const STATUS_FILTERS: { value: SupportTicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'Open', label: 'Открытые' },
  { value: 'InProgress', label: 'В работе' },
  { value: 'Resolved', label: 'Решённые' },
  { value: 'Closed', label: 'Закрытые' },
]

const STATUS_ACTIONS: SupportTicketStatus[] = ['InProgress', 'Resolved', 'Closed']

export const AdminSupportTab = () => {
  const queryClient = useQueryClient()
  const sessionUser = useSessionStore((s) => s.user)
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'all'>('all')
  const [openId, setOpenId] = useState<number | null>(null)
  const [reply, setReply] = useState('')

  const { data: tickets = [], isLoading, isError, error } = useQuery<SupportTicketDto[]>({
    queryKey: ['admin', 'support-tickets'],
    queryFn: fetchAllSupportTickets,
  })

  const { data: openTicket } = useQuery<SupportTicketDto>({
    queryKey: ['admin', 'support-ticket', openId],
    queryFn: () => fetchSupportTicket(openId as number),
    enabled: openId != null,
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'support-tickets'] }),
      openId != null ? queryClient.invalidateQueries({ queryKey: ['admin', 'support-ticket', openId] }) : Promise.resolve(),
    ])

  const replyMutation = useMutation({
    mutationFn: (vars: { id: number; text: string }) => postSupportMessage(vars.id, vars.text),
    onSuccess: async () => {
      setReply('')
      await refresh()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось отправить')),
  })

  const statusMutation = useMutation({
    mutationFn: (vars: { id: number; status: SupportTicketStatus }) => updateSupportTicketStatus(vars.id, vars.status),
    onSuccess: async () => {
      toast.success('Статус обновлён')
      await refresh()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось изменить статус')),
  })

  const assignMutation = useMutation({
    mutationFn: (vars: { id: number; agentId: number }) => assignSupportTicket(vars.id, vars.agentId),
    onSuccess: async () => {
      toast.success('Назначено')
      await refresh()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось назначить')),
  })

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return tickets
    return tickets.filter((t) => t.status === statusFilter)
  }, [tickets, statusFilter])

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Поддержка</h2></div>
          <p>Загрузка…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Поддержка</h2></div>
          <p>{extractMessage(error, 'Не удалось загрузить тикеты')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Поддержка</h2>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Статус</span>
            <select className={styles.input} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as SupportTicketStatus | 'all')}>
              {STATUS_FILTERS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Найдено</span>
            <div style={{ padding: '0.5rem 0' }}>{filtered.length}</div>
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Тикеты</p>
          <div className={styles.itemList}>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>Тикетов нет</p>
            ) : (
              filtered.map((ticket) => (
                <div key={ticket.id} className={styles.itemRow}>
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemIndex}>#{ticket.id} · {ticket.subject}</span>
                    <button type="button" className={styles.btnSecondary} onClick={() => setOpenId(openId === ticket.id ? null : ticket.id)}>
                      {openId === ticket.id ? 'Свернуть' : 'Открыть'}
                    </button>
                  </div>
                  <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.85rem' }}>
                    {SUPPORT_STATUS_LABELS[ticket.status].ru} · {ticket.customerUsername ?? `#${ticket.customerId}`}
                    {ticket.assignedAgentUsername ? ` · агент: ${ticket.assignedAgentUsername}` : ' · не назначен'} · {formatDateTime(ticket.updatedAt)}
                  </div>

                  {openId === ticket.id && openTicket && (
                    <div style={{ display: 'grid', gap: '0.75rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'grid', gap: '0.4rem' }}>
                        {openTicket.messages.map((m) => {
                          const mine = String(m.authorUserId) === String(sessionUser?.id)
                          const fromCustomer = m.authorUserId === openTicket.customerId
                          return (
                            <div
                              key={m.id}
                              style={{
                                justifySelf: fromCustomer ? 'start' : 'end',
                                maxWidth: '80%',
                                background: fromCustomer ? '#f3f4f6' : '#dbeafe',
                                borderRadius: 10,
                                padding: '0.5rem 0.75rem',
                              }}
                            >
                              <div style={{ fontSize: '0.72rem', color: 'var(--color-text-muted, #6b7280)' }}>
                                {mine ? 'Вы' : (m.authorUsername ?? (fromCustomer ? 'Клиент' : 'Агент'))} · {formatDateTime(m.createdAt)}
                              </div>
                              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                            </div>
                          )
                        })}
                      </div>

                      <div className={styles.actionRow}>
                        {sessionUser && (
                          <button type="button" className={styles.btnSecondary} disabled={assignMutation.isPending} onClick={() => assignMutation.mutate({ id: ticket.id, agentId: Number(sessionUser.id) })}>
                            Взять в работу
                          </button>
                        )}
                        {STATUS_ACTIONS.map((s) => (
                          <button
                            key={s}
                            type="button"
                            className={ticket.status === s ? styles.btnPrimary : styles.btnSecondary}
                            disabled={statusMutation.isPending || ticket.status === s}
                            onClick={() => statusMutation.mutate({ id: ticket.id, status: s })}
                          >
                            {SUPPORT_STATUS_LABELS[s].ru}
                          </button>
                        ))}
                      </div>

                      {ticket.status !== 'Closed' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            className={styles.input}
                            style={{ flex: 1 }}
                            value={reply}
                            onChange={(e) => setReply(e.target.value)}
                            placeholder="Ответ клиенту…"
                          />
                          <button type="button" className={styles.btnPrimary} disabled={replyMutation.isPending || !reply.trim()} onClick={() => replyMutation.mutate({ id: ticket.id, text: reply.trim() })}>
                            Ответить
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
