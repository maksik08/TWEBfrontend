import { useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createServiceTariff,
  deleteServiceTariff,
  fetchServiceTariffs,
  updateServiceTariff,
  type ServiceTariffDto,
  type ServiceTariffPayload,
} from '@/entities/service/api/service.api'
import styles from './admin.module.css'

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

type Draft = {
  id: number | null
  name: string
  description: string
  price: string
  isActive: boolean
}

const emptyDraft = (): Draft => ({ id: null, name: '', description: '', price: '', isActive: true })

const toDraft = (t: ServiceTariffDto): Draft => ({
  id: t.id,
  name: t.name,
  description: t.description ?? '',
  price: String(t.price),
  isActive: t.isActive,
})

export const AdminServiceTariffsTab = () => {
  const queryClient = useQueryClient()
  const [draft, setDraft] = useState<Draft | null>(null)

  const { data: tariffs = [], isLoading, isError, error } = useQuery<ServiceTariffDto[]>({
    queryKey: ['admin', 'service-tariffs'],
    queryFn: () => fetchServiceTariffs(true),
  })

  const invalidate = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'service-tariffs'] }),
      queryClient.invalidateQueries({ queryKey: ['service-tariffs'] }),
    ])

  const createMutation = useMutation({
    mutationFn: (payload: ServiceTariffPayload) => createServiceTariff(payload),
    onSuccess: async () => {
      toast.success('Тариф создан')
      setDraft(null)
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось создать тариф')),
  })

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number; payload: ServiceTariffPayload }) => updateServiceTariff(vars.id, vars.payload),
    onSuccess: async () => {
      toast.success('Тариф сохранён')
      setDraft(null)
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось сохранить тариф')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteServiceTariff(id),
    onSuccess: async () => {
      toast.success('Тариф удалён')
      setDraft(null)
      await invalidate()
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось удалить тариф')),
  })

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending

  const save = () => {
    if (!draft) return
    const name = draft.name.trim()
    if (name.length < 2) {
      toast.error('Название минимум 2 символа')
      return
    }
    const price = Number(draft.price)
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('Некорректная цена')
      return
    }
    const payload: ServiceTariffPayload = {
      name,
      description: draft.description.trim() || null,
      price,
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
    if (!window.confirm(`Удалить тариф «${draft.name}»?`)) return
    deleteMutation.mutate(draft.id)
  }

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Тарифы услуг</h2></div>
          <p>Загрузка…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}><h2 className={styles.cardTitle}>Тарифы услуг</h2></div>
          <p>{extractMessage(error, 'Не удалось загрузить тарифы')}</p>
        </div>
      </div>
    )
  }

  const isCreating = draft != null && draft.id == null

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Тарифы услуг</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnPrimary} onClick={() => setDraft(emptyDraft())} disabled={isPending}>
              + Новый тариф
            </button>
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Список</p>
          <div className={styles.itemList}>
            {tariffs.length === 0 ? (
              <p style={{ color: 'var(--color-text-muted, #6b7280)' }}>Тарифов пока нет</p>
            ) : (
              tariffs.map((t) => (
                <div key={t.id} className={styles.itemRow}>
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemIndex}>{t.name}</span>
                    <button type="button" className={styles.btnSecondary} onClick={() => setDraft(toDraft(t))} disabled={isPending}>
                      Редактировать
                    </button>
                  </div>
                  <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
                    ${t.price.toFixed(2)} · {t.isActive ? 'активен' : 'выключен'}
                    {t.description ? ` · ${t.description}` : ''}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Редактор</p>
          {!draft ? (
            <p>Выберите тариф или создайте новый.</p>
          ) : (
            <div className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>{isCreating ? 'Новый тариф' : draft.name}</span>
                <div className={styles.actionRow}>
                  {!isCreating && (
                    <button type="button" className={styles.btnDanger} onClick={handleDelete} disabled={isPending}>Удалить</button>
                  )}
                  <button type="button" className={styles.btnSecondary} onClick={() => setDraft(null)} disabled={isPending}>Отмена</button>
                  <button type="button" className={styles.btnPrimary} onClick={save} disabled={isPending}>
                    {isCreating ? 'Создать' : 'Сохранить'}
                  </button>
                </div>
              </div>
              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Название</span>
                  <input className={styles.input} value={draft.name} onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Цена</span>
                  <input className={styles.input} type="number" step="0.01" min="0" value={draft.price} onChange={(e) => setDraft((d) => (d ? { ...d, price: e.target.value } : d))} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Активен</span>
                  <input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft((d) => (d ? { ...d, isActive: e.target.checked } : d))} style={{ width: 20, height: 20, marginTop: 8 }} />
                </label>
                <label className={`${styles.field}`} style={{ gridColumn: '1 / -1' }}>
                  <span className={styles.fieldLabel}>Описание</span>
                  <textarea className={styles.textarea} rows={2} value={draft.description} onChange={(e) => setDraft((d) => (d ? { ...d, description: e.target.value } : d))} />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
