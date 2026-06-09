import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createServiceRequest,
  fetchMyServiceRequests,
  fetchServiceTariffs,
  payServiceRequest,
  rateServiceRequest,
  type ServiceRequestDto,
  type ServiceRequestStatus,
  type ServiceTariffDto,
} from '@/entities/service/api/service.api'
import { useSessionStore } from '@/entities/session/model/session.store'
import { useLanguage } from '@/shared/i18n'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

const money = (v: number) => `$${v.toFixed(2)}`
const formatDate = (v?: string | null) => (v ? new Date(v).toLocaleString('ru-RU') : '—')

const STATUS_LABELS: Record<ServiceRequestStatus, { ru: string; en: string }> = {
  Submitted: { ru: 'Создана', en: 'Submitted' },
  Accepted: { ru: 'Принята', en: 'Accepted' },
  Assigned: { ru: 'Назначен монтажник', en: 'Assigned' },
  InProgress: { ru: 'В работе', en: 'In progress' },
  Completed: { ru: 'Завершена', en: 'Completed' },
  Cancelled: { ru: 'Отменена', en: 'Cancelled' },
}

const card: React.CSSProperties = {
  border: '1px solid var(--color-border, #e5e7eb)',
  borderRadius: 12,
  padding: '1rem',
  background: 'var(--color-surface, #fff)',
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.4rem',
            lineHeight: 1,
            color: star <= value ? '#f59e0b' : '#d1d5db',
          }}
          aria-label={`${star}`}
        >
          ★
        </button>
      ))}
    </span>
  )
}

export default function ServicesPage() {
  const { t } = useLanguage()
  const queryClient = useQueryClient()
  const sessionUser = useSessionStore((s) => s.user)
  const patchUser = useSessionStore((s) => s.patchUser)
  const balance = sessionUser?.balance ?? 0

  const [tariffId, setTariffId] = useState<number | null>(null)
  const [address, setAddress] = useState('')
  const [phone, setPhone] = useState('')
  const [preferredVisitAt, setPreferredVisitAt] = useState('')
  const [description, setDescription] = useState('')
  const [ratingDraft, setRatingDraft] = useState<Record<number, { rating: number; comment: string }>>({})

  const { data: tariffs = [] } = useQuery<ServiceTariffDto[]>({
    queryKey: ['service-tariffs'],
    queryFn: () => fetchServiceTariffs(),
  })

  const { data: requests = [], isLoading } = useQuery<ServiceRequestDto[]>({
    queryKey: ['my-service-requests'],
    queryFn: fetchMyServiceRequests,
  })

  const selectedTariff = useMemo(
    () => tariffs.find((tr) => tr.id === tariffId) ?? null,
    [tariffs, tariffId],
  )

  const invalidateRequests = () => queryClient.invalidateQueries({ queryKey: ['my-service-requests'] })

  const createMutation = useMutation({
    mutationFn: createServiceRequest,
    onSuccess: async () => {
      toast.success(t({ ru: 'Заявка оформлена', en: 'Request created' }))
      setAddress('')
      setPhone('')
      setPreferredVisitAt('')
      setDescription('')
      setTariffId(null)
      await invalidateRequests()
    },
    onError: (err) => toast.error(extractMessage(err, t({ ru: 'Не удалось оформить заявку', en: 'Failed to create request' }))),
  })

  const payMutation = useMutation({
    mutationFn: (req: ServiceRequestDto) => payServiceRequest(req.id),
    onSuccess: async (_data, req) => {
      patchUser({ balance: balance - req.price })
      toast.success(t({ ru: 'Услуга оплачена', en: 'Service paid' }))
      await invalidateRequests()
    },
    onError: (err) => toast.error(extractMessage(err, t({ ru: 'Не удалось оплатить', en: 'Payment failed' }))),
  })

  const rateMutation = useMutation({
    mutationFn: (vars: { id: number; rating: number; comment: string }) =>
      rateServiceRequest(vars.id, vars.rating, vars.comment || undefined),
    onSuccess: async () => {
      toast.success(t({ ru: 'Спасибо за оценку', en: 'Thanks for your feedback' }))
      await invalidateRequests()
    },
    onError: (err) => toast.error(extractMessage(err, t({ ru: 'Не удалось оценить', en: 'Failed to rate' }))),
  })

  const submitCreate = () => {
    if (!tariffId) {
      toast.error(t({ ru: 'Выберите тариф', en: 'Select a tariff' }))
      return
    }
    if (address.trim().length < 5) {
      toast.error(t({ ru: 'Укажите адрес подключения', en: 'Enter the address' }))
      return
    }
    if (phone.trim().length < 5) {
      toast.error(t({ ru: 'Укажите телефон', en: 'Enter a phone' }))
      return
    }
    createMutation.mutate({
      serviceTariffId: tariffId,
      address: address.trim(),
      contactPhone: phone.trim(),
      description: description.trim() || undefined,
      preferredVisitAt: preferredVisitAt ? new Date(preferredVisitAt).toISOString() : null,
    })
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container" style={{ display: 'grid', gap: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>{t({ ru: 'Услуги и подключение', en: 'Services & installation' })}</h1>
          <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>
            {t({ ru: 'Выберите тариф, оформите заявку и отслеживайте её статус.', en: 'Pick a tariff, submit a request and track its status.' })}
          </p>
        </div>

        {/* ─── Оформление заявки ─────────────────────────────── */}
        <section style={{ display: 'grid', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>{t({ ru: 'Оформить заявку', en: 'New request' })}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
            {tariffs.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>
                {t({ ru: 'Тарифы пока не заданы.', en: 'No tariffs yet.' })}
              </p>
            ) : (
              tariffs.map((tr) => (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => setTariffId(tr.id)}
                  style={{
                    ...card,
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderColor: tariffId === tr.id ? '#2563eb' : 'var(--color-border, #e5e7eb)',
                    boxShadow: tariffId === tr.id ? '0 0 0 1px #2563eb' : undefined,
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{tr.name}</div>
                  {tr.description && (
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #6b7280)', margin: '0.25rem 0' }}>
                      {tr.description}
                    </div>
                  )}
                  <div style={{ fontWeight: 700, color: '#2563eb' }}>{money(tr.price)}</div>
                </button>
              ))
            )}
          </div>

          {selectedTariff && (
            <div style={{ ...card, display: 'grid', gap: '0.75rem', maxWidth: 560 }}>
              <strong>{t({ ru: 'Тариф', en: 'Tariff' })}: {selectedTariff.name} · {money(selectedTariff.price)}</strong>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>{t({ ru: 'Адрес подключения', en: 'Address' })}</span>
                <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t({ ru: 'Город, улица, дом', en: 'City, street, building' })} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>{t({ ru: 'Телефон', en: 'Phone' })}</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>{t({ ru: 'Желаемая дата визита', en: 'Preferred visit date' })}</span>
                <input type="datetime-local" value={preferredVisitAt} onChange={(e) => setPreferredVisitAt(e.target.value)} />
              </label>
              <label style={{ display: 'grid', gap: 4 }}>
                <span>{t({ ru: 'Комментарий', en: 'Comment' })}</span>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
              </label>
              <div>
                <button type="button" onClick={submitCreate} disabled={createMutation.isPending}>
                  {t({ ru: 'Оформить заявку', en: 'Create request' })}
                </button>
              </div>
            </div>
          )}
        </section>

        {/* ─── Мои заявки ─────────────────────────────────────── */}
        <section style={{ display: 'grid', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>{t({ ru: 'Мои заявки', en: 'My requests' })}</h2>
          {isLoading ? (
            <p>{t({ ru: 'Загрузка…', en: 'Loading…' })}</p>
          ) : requests.length === 0 ? (
            <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>{t({ ru: 'Заявок пока нет.', en: 'No requests yet.' })}</p>
          ) : (
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {requests.map((req) => {
                const draft = ratingDraft[req.id] ?? { rating: req.rating ?? 0, comment: req.ratingComment ?? '' }
                const canPay = !req.paidAt && req.status !== 'Cancelled'
                const canRate = req.status === 'Completed' && !req.ratedAt
                return (
                  <div key={req.id} style={{ ...card, display: 'grid', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                      <strong>{req.serviceTitle} · {money(req.price)}</strong>
                      <span style={{ fontWeight: 600, color: '#2563eb' }}>
                        {t(STATUS_LABELS[req.status])}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted, #6b7280)' }}>
                      #{req.requestNumber} · {req.address} · {formatDate(req.preferredVisitAt)}
                      {req.installerUsername && <> · {t({ ru: 'монтажник', en: 'installer' })}: {req.installerUsername}</>}
                    </div>

                    <div style={{ fontSize: '0.85rem' }}>
                      {req.paidAt
                        ? <span style={{ color: '#15803d' }}>{t({ ru: 'Оплачено', en: 'Paid' })} · {formatDate(req.paidAt)}</span>
                        : <span style={{ color: '#b45309' }}>{t({ ru: 'Не оплачено', en: 'Unpaid' })}</span>}
                    </div>

                    {req.completionReport && (
                      <div style={{ fontSize: '0.85rem' }}>
                        {t({ ru: 'Отчёт о выполнении', en: 'Completion report' })}: {req.completionReport}
                      </div>
                    )}

                    {canPay && (
                      <div>
                        <button type="button" onClick={() => payMutation.mutate(req)} disabled={payMutation.isPending}>
                          {t({ ru: 'Оплатить услугу', en: 'Pay for service' })} · {money(req.price)}
                        </button>
                        {balance < req.price && (
                          <span style={{ marginLeft: 8, fontSize: '0.85rem', color: '#b91c1c' }}>
                            {t({ ru: 'Недостаточно средств.', en: 'Insufficient funds.' })}{' '}
                            <Link to="/balance">{t({ ru: 'Пополнить', en: 'Top up' })}</Link>
                          </span>
                        )}
                      </div>
                    )}

                    {req.ratedAt ? (
                      <div style={{ fontSize: '0.85rem' }}>
                        {t({ ru: 'Ваша оценка', en: 'Your rating' })}: <span style={{ color: '#f59e0b' }}>{'★'.repeat(req.rating ?? 0)}</span>
                        {req.ratingComment ? ` — ${req.ratingComment}` : ''}
                      </div>
                    ) : canRate ? (
                      <div style={{ display: 'grid', gap: 6 }}>
                        <span style={{ fontSize: '0.85rem' }}>{t({ ru: 'Оцените качество услуги', en: 'Rate the service' })}</span>
                        <StarRating
                          value={draft.rating}
                          onChange={(v) => setRatingDraft((s) => ({ ...s, [req.id]: { ...draft, rating: v } }))}
                        />
                        <input
                          placeholder={t({ ru: 'Комментарий (необязательно)', en: 'Comment (optional)' })}
                          value={draft.comment}
                          onChange={(e) => setRatingDraft((s) => ({ ...s, [req.id]: { ...draft, comment: e.target.value } }))}
                          style={{ maxWidth: 360 }}
                        />
                        <div>
                          <button
                            type="button"
                            disabled={rateMutation.isPending || draft.rating < 1}
                            onClick={() => rateMutation.mutate({ id: req.id, rating: draft.rating, comment: draft.comment })}
                          >
                            {t({ ru: 'Отправить оценку', en: 'Submit rating' })}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
