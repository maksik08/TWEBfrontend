import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/entities/product/model/types'

export const COMPARE_LIMIT = 4

export type CompareAddResult =
  | { ok: true }
  | { ok: false; reason: 'limit' | 'category-mismatch'; expectedCategory?: string }

type CompareState = {
  items: Product[]
  add: (product: Product) => CompareAddResult
  remove: (productId: number) => void
  toggle: (product: Product) => CompareAddResult | { ok: true; removed: true }
  clear: () => void
  isInCompare: (productId: number) => boolean
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],

      add: (product) => {
        const { items } = get()

        if (items.some((item) => item.id === product.id)) {
          return { ok: true }
        }

        if (items.length >= COMPARE_LIMIT) {
          return { ok: false, reason: 'limit' }
        }

        const existingCategory = items[0]?.category
        if (existingCategory && existingCategory !== product.category) {
          return { ok: false, reason: 'category-mismatch', expectedCategory: existingCategory }
        }

        set({ items: [...items, product] })
        return { ok: true }
      },

      remove: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== productId) })),

      toggle: (product) => {
        const { items, add, remove } = get()
        if (items.some((item) => item.id === product.id)) {
          remove(product.id)
          return { ok: true, removed: true }
        }
        return add(product)
      },

      clear: () => set({ items: [] }),

      isInCompare: (productId) => get().items.some((item) => item.id === productId),
    }),
    {
      name: 'compare',
      version: 1,
    },
  ),
)

export const selectCompareCount = (state: { items: Product[] }) => state.items.length
