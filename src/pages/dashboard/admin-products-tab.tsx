import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import toast from 'react-hot-toast'
import axios from 'axios'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type {
  ProductAvailabilityState,
  ProductDto,
  ProductSpecificationDto,
} from '@/shared/api/dto/product.dto'
import type { CategoryDto } from '@/shared/api/dto/category.dto'
import type { SupplierDto } from '@/shared/api/dto/supplier.dto'
import {
  createProductDto,
  deleteProductDto,
  fetchProductDtos,
  updateProductDto,
  uploadProductImage,
} from '@/entities/product/api/products.admin'
import { fetchCategoryDtos } from '@/entities/product/api/categories.admin'
import { fetchSupplierDtos } from '@/entities/product/api/suppliers.admin'
import { resolveImageUrl } from '@/entities/product/model/product.helpers'
import styles from './admin.module.css'

type SpecDraft = { label: string; value: string }

type ProductDraft = {
  id: number | string | null
  name: string
  title: string
  price: string
  stockQuantity: string
  isPreorder: boolean
  isVisible: boolean
  categoryId: string
  supplierId: string
  image: string
  brand: string
  sku: string
  shortDescription: string
  description: string
  warranty: string
  availability: ProductAvailabilityState
  technology: string[]
  keyFeatures: string[]
  packageContents: string[]
  specifications: SpecDraft[]
}

const AVAILABILITY_OPTIONS: { value: ProductAvailabilityState; label: string }[] = [
  { value: 'InStock', label: 'В наличии' },
  { value: 'Limited', label: 'Ограниченно' },
  { value: 'Preorder', label: 'Под заказ' },
  { value: 'OutOfStock', label: 'Нет в наличии' },
]

const emptyDraft = (): ProductDraft => ({
  id: null,
  name: '',
  title: '',
  price: '',
  stockQuantity: '0',
  isPreorder: false,
  isVisible: true,
  categoryId: '',
  supplierId: '',
  image: '',
  brand: '',
  sku: '',
  shortDescription: '',
  description: '',
  warranty: '',
  availability: 'InStock',
  technology: [],
  keyFeatures: [],
  packageContents: [],
  specifications: [],
})

const sanitizeStringList = (values: Array<string | null> | null | undefined): string[] => {
  if (!Array.isArray(values)) return []
  return values
    .filter((v): v is string => typeof v === 'string')
    .map((v) => v)
}

const sanitizeSpecList = (
  values: Array<ProductSpecificationDto | null> | null | undefined,
): SpecDraft[] => {
  if (!Array.isArray(values)) return []
  return values
    .filter((entry): entry is ProductSpecificationDto => Boolean(entry))
    .map((entry) => ({ label: entry.label ?? '', value: entry.value ?? '' }))
}

const toDraft = (dto: ProductDto): ProductDraft => ({
  id: dto.id,
  name: (dto.name ?? '').toString(),
  title: (dto.title ?? '').toString(),
  price: (dto.price ?? '').toString(),
  stockQuantity: dto.stockQuantity != null ? String(dto.stockQuantity) : '0',
  isPreorder: Boolean(dto.isPreorder),
  isVisible: dto.isVisible ?? true,
  categoryId: dto.categoryId != null ? String(dto.categoryId) : '',
  supplierId: dto.supplierId != null ? String(dto.supplierId) : '',
  image: (dto.image ?? '').toString(),
  brand: (dto.brand ?? '').toString(),
  sku: (dto.sku ?? '').toString(),
  shortDescription: (dto.shortDescription ?? '').toString(),
  description: (dto.description ?? '').toString(),
  warranty: (dto.warranty ?? '').toString(),
  availability: dto.availabilityState ?? 'InStock',
  technology: sanitizeStringList(dto.technology),
  keyFeatures: sanitizeStringList(dto.keyFeatures),
  packageContents: sanitizeStringList(dto.packageContents),
  specifications: sanitizeSpecList(dto.specifications),
})

const extractMessage = (err: unknown, fallback: string): string => {
  if (axios.isAxiosError(err) && err.response?.data?.message) {
    return err.response.data.message as string
  }
  if (err instanceof Error) return err.message
  return fallback
}

function StringListEditor({
  label,
  placeholder,
  items,
  onChange,
  disabled,
}: {
  label: string
  placeholder?: string
  items: string[]
  onChange: (next: string[]) => void
  disabled?: boolean
}) {
  const updateAt = (index: number, value: string) => {
    const next = items.slice()
    next[index] = value
    onChange(next)
  }
  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
          Нет элементов
        </p>
      ) : (
        items.map((item, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input
              className={styles.input}
              value={item}
              placeholder={placeholder}
              onChange={(e) => updateAt(index, e.target.value)}
              disabled={disabled}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => removeAt(index)}
              disabled={disabled}
            >
              Удалить
            </button>
          </div>
        ))
      )}
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={() => onChange([...items, ''])}
        disabled={disabled}
      >
        + Добавить
      </button>
    </div>
  )
}

function SpecListEditor({
  items,
  onChange,
  disabled,
}: {
  items: SpecDraft[]
  onChange: (next: SpecDraft[]) => void
  disabled?: boolean
}) {
  const updateAt = (index: number, patch: Partial<SpecDraft>) => {
    const next = items.slice()
    next[index] = { ...next[index], ...patch }
    onChange(next)
  }
  const removeAt = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }
  return (
    <div className={styles.field}>
      <span className={styles.fieldLabel}>Характеристики</span>
      {items.length === 0 ? (
        <p style={{ color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem', margin: '0.25rem 0' }}>
          Нет характеристик
        </p>
      ) : (
        items.map((spec, index) => (
          <div
            key={index}
            style={{ display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}
          >
            <input
              className={styles.input}
              value={spec.label}
              placeholder="название"
              onChange={(e) => updateAt(index, { label: e.target.value })}
              disabled={disabled}
            />
            <input
              className={styles.input}
              value={spec.value}
              placeholder="значение"
              onChange={(e) => updateAt(index, { value: e.target.value })}
              disabled={disabled}
            />
            <button
              type="button"
              className={styles.btnSecondary}
              onClick={() => removeAt(index)}
              disabled={disabled}
            >
              Удалить
            </button>
          </div>
        ))
      )}
      <button
        type="button"
        className={styles.btnSecondary}
        onClick={() => onChange([...items, { label: '', value: '' }])}
        disabled={disabled}
      >
        + Добавить характеристику
      </button>
    </div>
  )
}

export const AdminProductsTab = () => {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [draft, setDraft] = useState<ProductDraft | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)

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
    updateMutation.isPending || createMutation.isPending || deleteMutation.isPending || isUploadingImage

  const handleImageFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setIsUploadingImage(true)
    try {
      const url = await uploadProductImage(file)
      setDraft((d) => (d ? { ...d, image: url } : d))
      toast.success('Картинка загружена')
    } catch (err) {
      toast.error(extractMessage(err, 'Не удалось загрузить картинку'))
    } finally {
      setIsUploadingImage(false)
    }
  }

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

    const stockQuantity = Number(draft.stockQuantity)
    if (!Number.isFinite(stockQuantity) || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
      toast.error('Остаток должен быть целым неотрицательным числом')
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

    const cleanStringList = (values: string[]) =>
      values.map((v) => v.trim()).filter((v) => v.length > 0)

    const cleanedSpecs = draft.specifications
      .map((spec) => ({ label: spec.label.trim(), value: spec.value.trim() }))
      .filter((spec) => spec.label.length > 0 && spec.value.length > 0)

    const payload = {
      name: trimmedName,
      title: draft.title.trim() || null,
      image: draft.image.trim() || null,
      price,
      stockQuantity,
      isPreorder: draft.isPreorder,
      isVisible: draft.isVisible,
      categoryId: categoryIdNum,
      supplierId: supplierIdNum,
      brand: draft.brand.trim() || null,
      sku: draft.sku.trim() || null,
      shortDescription: draft.shortDescription.trim() || null,
      description: draft.description.trim() || null,
      warranty: draft.warranty.trim() || null,
      availability: draft.availability,
      technology: cleanStringList(draft.technology),
      keyFeatures: cleanStringList(draft.keyFeatures),
      packageContents: cleanStringList(draft.packageContents),
      specifications: cleanedSpecs,
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
                        src={resolveImageUrl(dto.image.toString())}
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
                  <span className={styles.fieldLabel}>Остаток (шт.)</span>
                  <input
                    className={styles.input}
                    type="number"
                    step="1"
                    min="0"
                    value={draft.stockQuantity}
                    onChange={(e) => setDraft((d) => (d ? { ...d, stockQuantity: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Под заказ (preorder)</span>
                  <input
                    type="checkbox"
                    checked={draft.isPreorder}
                    onChange={(e) => setDraft((d) => (d ? { ...d, isPreorder: e.target.checked } : d))}
                    style={{ width: 20, height: 20, marginTop: 8 }}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Видим в каталоге</span>
                  <input
                    type="checkbox"
                    checked={draft.isVisible}
                    onChange={(e) => setDraft((d) => (d ? { ...d, isVisible: e.target.checked } : d))}
                    style={{ width: 20, height: 20, marginTop: 8 }}
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

              <div className={styles.fieldGrid}>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Бренд</span>
                  <input
                    className={styles.input}
                    value={draft.brand}
                    onChange={(e) => setDraft((d) => (d ? { ...d, brand: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>SKU</span>
                  <input
                    className={styles.input}
                    value={draft.sku}
                    onChange={(e) => setDraft((d) => (d ? { ...d, sku: e.target.value } : d))}
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Гарантия</span>
                  <input
                    className={styles.input}
                    value={draft.warranty}
                    onChange={(e) => setDraft((d) => (d ? { ...d, warranty: e.target.value } : d))}
                    placeholder="например, 24 месяца"
                  />
                </label>
                <label className={styles.field}>
                  <span className={styles.fieldLabel}>Доступность</span>
                  <select
                    className={styles.input}
                    value={draft.availability}
                    onChange={(e) =>
                      setDraft((d) =>
                        d ? { ...d, availability: e.target.value as ProductAvailabilityState } : d,
                      )
                    }
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Краткое описание</span>
                <textarea
                  className={styles.textarea}
                  rows={2}
                  value={draft.shortDescription}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, shortDescription: e.target.value } : d))
                  }
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Описание</span>
                <textarea
                  className={styles.textarea}
                  rows={5}
                  value={draft.description}
                  onChange={(e) =>
                    setDraft((d) => (d ? { ...d, description: e.target.value } : d))
                  }
                />
              </label>

              <StringListEditor
                label="Технологии"
                placeholder="например, Wi-Fi 6"
                items={draft.technology}
                onChange={(next) => setDraft((d) => (d ? { ...d, technology: next } : d))}
                disabled={isPending}
              />

              <StringListEditor
                label="Ключевые особенности"
                placeholder="одна строка — одна особенность"
                items={draft.keyFeatures}
                onChange={(next) => setDraft((d) => (d ? { ...d, keyFeatures: next } : d))}
                disabled={isPending}
              />

              <StringListEditor
                label="Комплектация"
                placeholder="например, Блок питания"
                items={draft.packageContents}
                onChange={(next) => setDraft((d) => (d ? { ...d, packageContents: next } : d))}
                disabled={isPending}
              />

              <SpecListEditor
                items={draft.specifications}
                onChange={(next) => setDraft((d) => (d ? { ...d, specifications: next } : d))}
                disabled={isPending}
              />

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Картинка (URL или загрузить файл)</span>
                <input
                  className={styles.input}
                  value={draft.image}
                  onChange={(e) => setDraft((d) => (d ? { ...d, image: e.target.value } : d))}
                  placeholder="/images/product/... или /uploads/products/..."
                />
              </label>

              <label className={styles.field}>
                <span className={styles.fieldLabel}>Загрузить из файла (jpg, png, webp, gif — до 5 МБ)</span>
                <input
                  className={styles.input}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={handleImageFileChange}
                  disabled={isPending}
                />
                {isUploadingImage && (
                  <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted, #6b7280)' }}>
                    Загрузка…
                  </span>
                )}
              </label>

              {draft.image && (
                <img
                  src={resolveImageUrl(draft.image)}
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
