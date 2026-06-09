import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCoupon,
  deleteCoupon,
  fetchCoupons,
  updateCoupon,
  type CouponDto,
  type CouponPayload,
  type DiscountType,
} from '@/entities/coupon/api/coupon.api'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

type CouponDraft = {
  id: number | null
  code: string
  discountType: DiscountType
  discountValue: string
  minOrderAmount: string
  maxUses: string
  expiresAt: string
  isActive: boolean
}

const emptyDraft = (): CouponDraft => ({
  id: null,
  code: '',
  discountType: 'Percentage',
  discountValue: '',
  minOrderAmount: '0',
  maxUses: '',
  expiresAt: '',
  isActive: true,
})

// Backend ISO -> value for <input type="datetime-local">
const toLocalInput = (iso?: string | null): string => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const toDraft = (c: CouponDto): CouponDraft => ({
  id: c.id,
  code: c.code,
  discountType: c.discountType,
  discountValue: String(c.discountValue),
  minOrderAmount: String(c.minOrderAmount),
  maxUses: c.maxUses != null ? String(c.maxUses) : '',
  expiresAt: toLocalInput(c.expiresAt),
  isActive: c.isActive,
})

const formatDiscount = (c: CouponDto) =>
  c.discountType === 'Percentage' ? `${c.discountValue}%` : `$${c.discountValue.toFixed(2)}`

export const AdminCouponsTab = () => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<CouponDraft | null>(null)

  const { data: coupons = [], isLoading, isError, error } = useQuery<CouponDto[]>({
    queryKey: ['admin', 'coupons'],
    queryFn: fetchCoupons,
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'coupons'] })

  const createMutation = useMutation({
    mutationFn: (payload: CouponPayload) => createCoupon(payload),
    onSuccess: async () => {
      toast.success('Промокод создан')
      setDraft(null)
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось создать промокод')),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: CouponPayload }) => updateCoupon(vars.id, vars.payload),
    onSuccess: async () => {
      toast.success('Промокод сохранён')
      setDraft(null)
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось сохранить промокод')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteCoupon(id),
    onSuccess: async () => {
      toast.success('Промокод удалён')
      setDraft(null)
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось удалить промокод')),
  })

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const sorted = useMemo(() => coupons, [coupons])

  const save = () => {
    if (!draft) return
    const code = draft.code.trim()
    if (code.length < 2) {
      toast.error('Код минимум 2 символа')
      return
    }
    const value = Number(draft.discountValue)
    if (!Number.isFinite(value) || value <= 0) {
      toast.error('Некорректное значение скидки')
      return
    }
    if (draft.discountType === 'Percentage' && value > 100) {
      toast.error('Процент не может превышать 100')
      return
    }
    const minOrder = Number(draft.minOrderAmount) || 0
    if (minOrder < 0) {
      toast.error('Некорректная минимальная сумма')
      return
    }
    const maxUses = draft.maxUses.trim() === '' ? null : Number(draft.maxUses)
    if (maxUses !== null && (!Number.isInteger(maxUses) || maxUses < 1)) {
      toast.error('Лимит использований должен быть целым ≥ 1')
      return
    }

    const payload: CouponPayload = {
      code,
      discountType: draft.discountType,
      discountValue: value,
      minOrderAmount: minOrder,
      maxUses,
      expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
      isActive: draft.isActive,
    }

    if (draft.id == null) {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate({ id: draft.id, payload })
    }
  }

  const handleDelete = () => {
    if (!draft || draft.id == null) return
    if (!window.confirm(`Удалить промокод «${draft.code}»?`)) return
    deleteMutation.mutate(draft.id)
  }

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Промокоды</h2>
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
            <h2 className={styles.cardTitle}>Промокоды</h2>
          </div>
          <p>{extractMessage(error, 'Не удалось загрузить промокоды')}</p>
        </div>
      </div>
    )
  }

  const isCreating = draft != null && draft.id == null

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Промокоды</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnPrimary} onClick={() => setDraft(emptyDraft())} disabled={isPending}>
              + Новый промокод
            </button>
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Список</p>
          <div className={styles.itemList}>
            {sorted.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>Промокодов пока нет</p>
            ) : (
              sorted.map((c) => (
                <div key={c.id} className={styles.itemRow}>
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemIndex}>{c.code}</span>
                    <button type="button" className={styles.btnSecondary} onClick={() => setDraft(toDraft(c))} disabled={isPending}>
                      Редактировать
                    </button>
                  </div>
                  <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
                    Скидка: {formatDiscount(c)} · мин. заказ: ${c.minOrderAmount.toFixed(2)} · использовано:{' '}
                    {c.usedCount}
                    {c.maxUses != null ? ` / ${c.maxUses}` : ''} ·{' '}
                    {c.isActive ? 'активен' : 'выключен'}
                    {c.expiresAt ? ` · до ${new Date(c.expiresAt).toLocaleDateString('ru-RU')}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Редактор</p>
          {!draft ? (
            <p>Выберите промокод или создайте новый.</p>
          ) : (
            <div className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>{isCreating ? 'Новый промокод' : `Код: ${draft.code}`}</span>
                <div className={styles.actionRow}>
                  {!isCreating && (
                    <button type="button" className={styles.btnDanger} onClick={handleDelete} disabled={isPending}>
                      Удалить
                    </button>
                  )}
                  <button type="button" className={styles.btnSecondary} onClick={() => setDraft(null)} disabled={isPending}>
                    Отмена
                  </button>
                  <button type="button" className={styles.btnPrimary} onClick={save} disabled={isPending}>
                    {isCreating ? 'Создать' : 'Сохранить'}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Код</span>
                  <input
                    className={styles.input}
                    value={draft.code}
                    onChange={(e) => setDraft((d) => (d ? { ...d, code: e.target.value.toUpperCase() } : d))}
                    placeholder="SUMMER10"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Тип скидки</span>
                  <select
                    className={styles.input}
                    value={draft.discountType}
                    onChange={(e) => setDraft((d) => (d ? { ...d, discountType: e.target.value as DiscountType } : d))}
                  >
                    <option value="Percentage">Процент (%)</option>
                    <option value="Fixed">Фиксированная ($)</option>
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Значение</span>
                  <input
                    className={styles.input}
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.discountValue}
                    onChange={(e) => setDraft((d) => (d ? { ...d, discountValue: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Мин. сумма заказа</span>
                  <input
                    className={styles.input}
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.minOrderAmount}
                    onChange={(e) => setDraft((d) => (d ? { ...d, minOrderAmount: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Лимит использований (пусто = ∞)</span>
                  <input
                    className={styles.input}
                    type="number"
                    step="1"
                    min="1"
                    value={draft.maxUses}
                    onChange={(e) => setDraft((d) => (d ? { ...d, maxUses: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Действует до (необязательно)</span>
                  <input
                    className={styles.input}
                    type="datetime-local"
                    value={draft.expiresAt}
                    onChange={(e) => setDraft((d) => (d ? { ...d, expiresAt: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Активен</span>
                  <input
                    type="checkbox"
                    checked={draft.isActive}
                    onChange={(e) => setDraft((d) => (d ? { ...d, isActive: e.target.checked } : d))}
                    style={{ width: 20, height: 20, marginTop: 8 }}
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
