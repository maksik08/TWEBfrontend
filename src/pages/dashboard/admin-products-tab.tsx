import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductDto } from '@/shared/api/dto/product.dto'
import { fetchProductDtos, updateProductDto } from '@/entities/product/api/products.admin'
import styles from './admin.module.css'

type ProductDraft = {
  id: number | string
  name: string
  title: string
  price: string
  category: string
  image: string
}

const toDraft = (dto: ProductDto): ProductDraft => ({
  id: dto.id,
  name: (dto.name ?? '').toString(),
  title: (dto.title ?? '').toString(),
  price: (dto.price ?? '').toString(),
  category: (dto.category ?? '').toString(),
  image: (dto.image ?? '').toString(),
})

export const AdminProductsTab = () => {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState<number | string | null>(null)
  const [draft, setDraft] = useState<ProductDraft | null>(null)

  const { data: dtos = [], isLoading, isError, error } = useQuery<ProductDto[]>({
    queryKey: ['admin', 'products'],
    queryFn: fetchProductDtos,
  })

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dtos
    return dtos.filter((dto) => {
      const text = `${dto.title ?? ''} ${dto.name ?? ''} ${dto.category ?? ''} ${dto.id}`.toLowerCase()
      return text.includes(q)
    })
  }, [dtos, query])

  const mutation = useMutation({
    mutationFn: updateProductDto,
    onSuccess: async () => {
      toast.success('Товар сохранён')
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ])
    },
  })

  const startEdit = (dto: ProductDto) => {
    setSelectedId(dto.id)
    setDraft(toDraft(dto))
  }

  const cancelEdit = () => {
    setSelectedId(null)
    setDraft(null)
  }

  const save = () => {
    if (!draft) return
    const id = Number(draft.id)
    const price = Number(draft.price)

    if (!Number.isFinite(id)) {
      toast.error('Некорректный id')
      return
    }
    if (!Number.isFinite(price)) {
      toast.error('Некорректная цена')
      return
    }

    mutation.mutate({
      id: draft.id,
      name: draft.name.trim(),
      title: draft.title.trim(),
      price,
      category: draft.category.trim(),
      image: draft.image.trim(),
    })
  }

  if (isLoading) {
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Товары</h2>
          </div>
          <p>Загрузка…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    const message = error instanceof Error ? error.message : 'Не удалось загрузить товары'
    return (
      <div className={styles.content}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>Товары</h2>
          </div>
          <p>{message}</p>
        </div>
      </div>
    )
  }

  const selectedDto = selectedId == null ? null : dtos.find((d) => String(d.id) === String(selectedId)) ?? null

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Товары</h2>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Поиск</span>
            <input className={styles.input} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Название / категория / id" />
          </label>
          <div className={styles.field}>
            <span className={styles.fieldLabel}>Найдено</span>
            <div style={{ padding: '0.5rem 0' }}>{filtered.length}</div>
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Список</p>
          <div className={styles.itemList}>
            {filtered.map((dto) => {
              const isActive = String(dto.id) === String(selectedId)
              const title = (dto.title ?? dto.name ?? '').toString()
              return (
                <div key={String(dto.id)} className={styles.itemRow} style={isActive ? { borderColor: '#2563eb' } : undefined}>
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemIndex}>ID: {dto.id}</span>
                    <button type="button" className={styles.btnSecondary} onClick={() => startEdit(dto)}>
                      Редактировать
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '0.75rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700 }}>{title || '(без названия)'}</div>
                      <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
                        Категория: {(dto.category ?? '').toString() || '—'} · Цена: {dto.price}
                      </div>
                    </div>
                    {dto.image ? (
                      <img
                        src={dto.image.toString()}
                        alt={title}
                        style={{ width: 72, height: 48, objectFit: 'contain', border: '1px solid var(--color-border, #e5e7eb)', borderRadius: 8, background: '#fff' }}
                      />
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className={styles.subSection}>
          <p className={styles.subTitle}>Редактор</p>
          {!draft || !selectedDto ? (
            <p>Выберите товар и нажмите «Редактировать».</p>
          ) : (
            <div className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>ID: {selectedDto.id}</span>
                <div className={styles.actionRow}>
                  <button type="button" className={styles.btnSecondary} onClick={cancelEdit} disabled={mutation.isPending}>
                    Отмена
                  </button>
                  <button type="button" className={styles.btnPrimary} onClick={save} disabled={mutation.isPending}>
                    Сохранить
                  </button>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Название (name)</span>
                  <input className={styles.input} value={draft.name} onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Заголовок (title)</span>
                  <input className={styles.input} value={draft.title} onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Цена</span>
                  <input className={styles.input} value={draft.price} onChange={(e) => setDraft((d) => (d ? { ...d, price: e.target.value } : d))} />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Категория</span>
                  <input className={styles.input} value={draft.category} onChange={(e) => setDraft((d) => (d ? { ...d, category: e.target.value } : d))} placeholder="router / switch / antenna / cable / nas / server" />
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Картинка (image URL)</span>
                <input className={styles.input} value={draft.image} onChange={(e) => setDraft((d) => (d ? { ...d, image: e.target.value } : d))} placeholder="/images/product/..." />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

