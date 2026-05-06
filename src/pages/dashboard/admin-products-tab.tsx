import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ProductDto } from '@/shared/api/dto/product.dto'
import type { CategoryDto } from '@/shared/api/dto/category.dto'
import type { SupplierDto } from '@/shared/api/dto/supplier.dto'
import {
  createProductDto,
  deleteProductDto,
  fetchProductDtos,
  updateProductDto,
} from '@/entities/product/api/products.admin'
import { fetchCategoryDtos } from '@/entities/product/api/categories.admin'
import { fetchSupplierDtos } from '@/entities/product/api/suppliers.admin'
import styles from './admin.module.css'

type ProductDraft = {
  id: number | string | null
  name: string
  title: string
  price: string
  categoryId: string
  supplierId: string
  image: string
}

const emptyDraft = (): ProductDraft => ({
  id: null,
  name: '',
  title: '',
  price: '',
  categoryId: '',
  supplierId: '',
  image: '',
})

const toDraft = (dto: ProductDto): ProductDraft => ({
  id: dto.id,
  name: (dto.name ?? '').toString(),
  title: (dto.title ?? '').toString(),
  price: (dto.price ?? '').toString(),
  categoryId: dto.categoryId != null ? String(dto.categoryId) : '',
  supplierId: dto.supplierId != null ? String(dto.supplierId) : '',
  image: (dto.image ?? '').toString(),
})

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

export const AdminProductsTab = () => {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<ProductDraft | null>(null)

  const { data: dtos = [], isLoading, isError, error } = useQuery<ProductDto[]>({
    queryKey: ['admin', 'products'],
    queryFn: fetchProductDtos,
  })

  const { data: categories = [] } = useQuery<CategoryDto[]>({
    queryKey: ['admin', 'categories'],
    queryFn: fetchCategoryDtos,
  })

  const { data: suppliers = [] } = useQuery<SupplierDto[]>({
    queryKey: ['admin', 'suppliers'],
    queryFn: fetchSupplierDtos,
  })

  const categoryNameById = useMemo(() => {
    const map = new Map<number, string>()
    categories.forEach((c) => map.set(c.id, c.name))
    return map
  }, [categories])

  const resolveCategoryLabel = (dto: ProductDto): string => {
    if (dto.category) return dto.category
    if (dto.categoryId != null) return categoryNameById.get(dto.categoryId) ?? ''
    return ''
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return dtos
    return dtos.filter((dto) => {
      const text = `${dto.title ?? ''} ${dto.name ?? ''} ${resolveCategoryLabel(dto)} ${dto.id}`.toLowerCase()
      return text.includes(q)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dtos, query, categoryNameById])

  const invalidateProducts = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
    ])
  }

  const updateMutation = useMutation({
    mutationFn: (vars: { id: number | string; payload: Parameters<typeof updateProductDto>[1] }) =>
      updateProductDto(vars.id, vars.payload),
    onSuccess: async () => {
      toast.success('Товар сохранён')
      await invalidateProducts()
      setDraft(null)
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось сохранить товар')),
  })

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof createProductDto>[0]) => createProductDto(payload),
    onSuccess: async () => {
      toast.success('Товар создан')
      await invalidateProducts()
      setDraft(null)
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось создать товар')),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number | string) => deleteProductDto(id),
    onSuccess: async () => {
      toast.success('Товар удалён')
      await invalidateProducts()
      setDraft(null)
    },
    onError: (err) => toast.error(extractMessage(err, 'Не удалось удалить товар')),
  })

  const isPending =
    updateMutation.isPending || createMutation.isPending || deleteMutation.isPending

  useEffect(() => {
    if (!draft || draft.id == null) return
    const stillExists = dtos.some((d) => String(d.id) === String(draft.id))
    if (!stillExists) setDraft(null)
  }, [dtos, draft])

  const startCreate = () => setDraft(emptyDraft())
  const startEdit = (dto: ProductDto) => setDraft(toDraft(dto))
  const cancelEdit = () => setDraft(null)

  const save = () => {
    if (!draft) return

    const trimmedName = draft.name.trim()
    if (!trimmedName) {
      toast.error('Название обязательно')
      return
    }

    const price = Number(draft.price)
    if (!Number.isFinite(price) || price < 0) {
      toast.error('Некорректная цена')
      return
    }

    const categoryIdNum = draft.categoryId === '' ? null : Number(draft.categoryId)
    if (categoryIdNum !== null && !Number.isFinite(categoryIdNum)) {
      toast.error('Некорректная категория')
      return
    }

    const supplierIdNum = draft.supplierId === '' ? null : Number(draft.supplierId)
    if (supplierIdNum !== null && !Number.isFinite(supplierIdNum)) {
      toast.error('Некорректный поставщик')
      return
    }

    const payload = {
      name: trimmedName,
      title: draft.title.trim() || null,
      image: draft.image.trim() || null,
      price,
      categoryId: categoryIdNum,
      supplierId: supplierIdNum,
    }

    if (draft.id == null) {
      createMutation.mutate(payload)
    } else {
      updateMutation.mutate({ id: draft.id, payload })
    }
  }

  const handleDelete = () => {
    if (!draft || draft.id == null) return
    const ok = window.confirm(`Удалить товар #${draft.id}? Действие необратимо.`)
    if (!ok) return
    deleteMutation.mutate(draft.id)
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
    const message = extractMessage(error, 'Не удалось загрузить товары')
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

  const isCreating = draft != null && draft.id == null

  return (
    <div className={styles.content}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Товары</h2>
          <div className={styles.actionRow}>
            <button type="button" className={styles.btnPrimary} onClick={startCreate} disabled={isPending}>
              + Новый товар
            </button>
          </div>
        </div>

        <div className={styles.fieldGrid}>
          <label className={styles.field}>
            <span className={styles.fieldLabel}>Поиск</span>
            <input
              className={styles.input}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Название / категория / id"
            />
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
              const isActive = draft?.id != null && String(dto.id) === String(draft.id)
              const title = (dto.title ?? dto.name ?? '').toString()
              const categoryLabel = resolveCategoryLabel(dto)
              return (
                <div
                  key={String(dto.id)}
                  className={styles.itemRow}
                  style={isActive ? { borderColor: '#2563eb' } : undefined}
                >
                  <div className={styles.itemRowHeader}>
                    <span className={styles.itemIndex}>ID: {dto.id}</span>
                    <button
                      type="button"
                      className={styles.btnSecondary}
                      onClick={() => startEdit(dto)}
                      disabled={isPending}
                    >
                      Редактировать
                    </button>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '0.75rem',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700 }}>{title || '(без названия)'}</div>
                      <div style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem' }}>
                        Категория: {categoryLabel || '—'} · Цена: {dto.price}
                      </div>
                    </div>
                    {dto.image ? (
                      <img
                        src={dto.image.toString()}
                        alt={title}
                        style={{
                          width: 72,
                          height: 48,
                          objectFit: 'contain',
                          border: '1px solid var(--color-border, #e5e7eb)',
                          borderRadius: 8,
                          background: '#fff',
                        }}
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
          {!draft ? (
            <p>Выберите товар и нажмите «Редактировать», или создайте новый.</p>
          ) : (
            <div className={styles.itemRow}>
              <div className={styles.itemRowHeader}>
                <span className={styles.itemIndex}>
                  {isCreating ? 'Новый товар' : `ID: ${draft.id}`}
                </span>
                <div className={styles.actionRow}>
                  {!isCreating && (
                    <button
                      type="button"
                      className={styles.btnDanger}
                      onClick={handleDelete}
                      disabled={isPending}
                    >
                      Удалить
                    </button>
                  )}
                  <button
                    type="button"
                    className={styles.btnSecondary}
                    onClick={cancelEdit}
                    disabled={isPending}
                  >
                    Отмена
                  </button>
                  <button
                    type="button"
                    className={styles.btnPrimary}
                    onClick={save}
                    disabled={isPending}
                  >
                    {isCreating ? 'Создать' : 'Сохранить'}
                  </button>
                </div>
              </div>

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Название (name)</span>
                  <input
                    className={styles.input}
                    value={draft.name}
                    onChange={(e) => setDraft((d) => (d ? { ...d, name: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Заголовок (title)</span>
                  <input
                    className={styles.input}
                    value={draft.title}
                    onChange={(e) => setDraft((d) => (d ? { ...d, title: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Цена</span>
                  <input
                    className={styles.input}
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.price}
                    onChange={(e) => setDraft((d) => (d ? { ...d, price: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Категория</span>
                  <select
                    className={styles.input}
                    value={draft.categoryId}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, categoryId: e.target.value } : d))
                    }
                  >
                    <option value="">— не выбрана —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Поставщик</span>
                  <select
                    className={styles.input}
                    value={draft.supplierId}
                    onChange={(e) =>
                      setDraft((d) => (d ? { ...d, supplierId: e.target.value } : d))
                    }
                  >
                    <option value="">— не выбран —</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={String(s.id)}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Картинка (image URL)</span>
                <input
                  className={styles.input}
                  value={draft.image}
                  onChange={(e) => setDraft((d) => (d ? { ...d, image: e.target.value } : d))}
                  placeholder="/images/product/..."
                />
              </label>

              {draft.image && (
                <img
                  src={draft.image}
                  alt="preview"
                  style={{
                    marginTop: '0.5rem',
                    maxWidth: 160,
                    maxHeight: 120,
                    objectFit: 'contain',
                    border: '1px solid var(--color-border, #e5e7eb)',
                    borderRadius: 8,
                    background: '#fff',
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
