import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSupportTicket,
  fetchMySupportTickets,
  fetchSupportTicket,
  postSupportMessage,
  SUPPORT_STATUS_LABELS,
  type SupportTicketDto,
} from '@/entities/support/api/support.api'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useLanguage } from '@/shared/i18n'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

const formatDateTime = (v: string) => new Date(v).toLocaleString('ru-RU')

const card: React.CSSProperties = {
  border: '1px solid var(--color-border, #e5e7eb)',
  borderRadius: 12,
  padding: '1rem',
  background: 'var(--color-surface, #fff)',
}

export default function SupportPage() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const sessionUser = useSessionStore((s) => s.user)

  const [subject, setSubject] = useState('')
  const [firstMessage, setFirstMessage] = useState('')
  const [openId, setOpenId] = useState<number | null>(null)
  const [reply, setReply] = useState('')

  const { data: tickets = [], isLoading } = useQuery<SupportTicketDto[]>({
    queryKey: ['my-support-tickets'],
    queryFn: fetchMySupportTickets,
  })

  const { data: openTicket } = useQuery<SupportTicketDto>({
    queryKey: ['support-ticket', openId],
    queryFn: () => fetchSupportTicket(openId as number),
    enabled: openId != null,
  })

  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['my-support-tickets'] }),
      openId != null ? queryClient.invalidateQueries({ queryKey: ['support-ticket', openId] }) : Promise.resolve(),
    ])

  const createMutation = useMutation({
    mutationFn: createSupportTicket,
    onSuccess: async (ticket) => {
      toast.success(t({ ru: 'Обращение создано', en: 'Ticket created' }))
      setSubject('')
      setFirstMessage('')
      setOpenId(ticket.id)
      await refresh()
    },
    onError: (err) => toast.error(extractMessage(err, t({ ru: 'Не удалось создать обращение', en: 'Failed to create ticket' }))),
  })

  const replyMutation = useMutation({
    mutationFn: (vars: { id: number; text: string }) => postSupportMessage(vars.id, vars.text),
    onSuccess: async () => {
      setReply('')
      await refresh()
    },
    onError: (err) => toast.error(extractMessage(err, t({ ru: 'Не удалось отправить', en: 'Failed to send' }))),
  })

  const submitCreate = () => {
    if (subject.trim().length < 3) {
      toast.error(t({ ru: 'Тема минимум 3 символа', en: 'Subject too short' }))
      return
    }
    if (firstMessage.trim().length < 1) {
      toast.error(t({ ru: 'Опишите проблему', en: 'Describe the issue' }))
      return
    }
    createMutation.mutate({ subject: subject.trim(), message: firstMessage.trim() })
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'minmax(260px, 1fr) 2fr', gap: '2rem', alignItems: 'start' }}>
        {/* Left: list + create */}
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          <div>
            <h1 style={{ margin: '0 0 0.5rem' }}>{t({ ru: 'Поддержка', en: 'Support' })}</h1>
            <p style={{ color: 'var(--color-text-muted, #6b7280)', margin: 0 }}>
              {t({ ru: 'Создайте обращение и общайтесь с поддержкой.', en: 'Open a ticket and chat with support.' })}
            </p>
          </div>

          <div style={{ ...card, display: 'grid', gap: '0.5rem' }}>
            <strong>{t({ ru: 'Новое обращение', en: 'New ticket' })}</strong>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={t({ ru: 'Тема', en: 'Subject' })} />
            <textarea rows={3} value={firstMessage} onChange={(e) => setFirstMessage(e.target.value)} placeholder={t({ ru: 'Опишите проблему', en: 'Describe the issue' })} />
            <div>
              <button type="button" onClick={submitCreate} disabled={createMutation.isPending}>
                {t({ ru: 'Создать', en: 'Create' })}
              </button>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <strong>{t({ ru: 'Мои обращения', en: 'My tickets' })}</strong>
            {isLoading ? (
              <p>{t({ ru: 'Загрузка…', en: 'Loading…' })}</p>
            ) : tickets.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>{t({ ru: 'Обращений пока нет.', en: 'No tickets yet.' })}</p>
            ) : (
              tickets.map((ticket) => (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => setOpenId(ticket.id)}
                  style={{
                    ...card,
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderColor: openId === ticket.id ? '#2563eb' : 'var(--color-border, #e5e7eb)',
                  }}
                >
                  <div style={{ fontWeight: 700 }}>#{ticket.id} · {ticket.subject}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted, #6b7280)' }}>
                    {t(SUPPORT_STATUS_LABELS[ticket.status])} · {formatDateTime(ticket.updatedAt)}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Right: thread */}
        <div style={{ ...card, minHeight: 300 }}>
          {!openTicket ? (
            <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>{t({ ru: 'Выберите обращение слева.', en: 'Pick a ticket on the left.' })}</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <strong>#{openTicket.id} · {openTicket.subject}</strong>
                <span style={{ fontWeight: 600, color: '#2563eb' }}>{t(SUPPORT_STATUS_LABELS[openTicket.status])}</span>
              </div>

              <div style={{ display: 'grid', gap: '0.5rem' }}>
                {openTicket.messages.map((m) => {
                  const mine = String(m.authorUserId) === String(sessionUser?.id)
                  return (
                    <div
                      key={m.id}
                      style={{
                        justifySelf: mine ? 'end' : 'start',
                        maxWidth: '80%',
                        background: mine ? '#dbeafe' : '#f3f4f6',
                        borderRadius: 10,
                        padding: '0.5rem 0.75rem',
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted, #6b7280)' }}>
                        {mine ? t({ ru: 'Вы', en: 'You' }) : (m.authorUsername ?? t({ ru: 'Поддержка', en: 'Support' }))} · {formatDateTime(m.createdAt)}
                      </div>
                      <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                    </div>
                  )
                })}
              </div>

              {openTicket.status === 'Closed' ? (
                <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>{t({ ru: 'Обращение закрыто.', en: 'This ticket is closed.' })}</p>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    style={{ flex: 1 }}
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={t({ ru: 'Сообщение…', en: 'Message…' })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && reply.trim()) replyMutation.mutate({ id: openTicket.id, text: reply.trim() })
                    }}
                  />
                  <button
                    type="button"
                    disabled={replyMutation.isPending || !reply.trim()}
                    onClick={() => replyMutation.mutate({ id: openTicket.id, text: reply.trim() })}
                  >
                    {t({ ru: 'Отправить', en: 'Send' })}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
