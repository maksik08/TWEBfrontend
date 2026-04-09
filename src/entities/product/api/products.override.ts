import type { ProductDto } from '@/shared/api/dto/product.dto'

type ProductsOverridePayload = {
  version: 1
  items: ProductDto[]
}

const STORAGE_KEY = 'netinstall-products'

const parsePayload = (raw: string): ProductsOverridePayload | null => {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null

    const payload = parsed as Partial<ProductsOverridePayload>
    if (payload.version !== 1) return null
    if (!Array.isArray(payload.items)) return null

    return { version: 1, items: payload.items as ProductDto[] }
  } catch {
    return null
  }
}

export const productsOverride = {
  get(): ProductDto[] | null {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parsePayload(raw)?.items ?? null
  },

  set(items: ProductDto[]) {
    if (typeof window === 'undefined') return
    const payload: ProductsOverridePayload = { version: 1, items }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  },

  clear() {
    if (typeof window === 'undefined') return
    window.localStorage.removeItem(STORAGE_KEY)
  },
} as const

