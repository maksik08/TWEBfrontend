import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/entities/product'

export type CartProductItem = {
  product: Product
  quantity: number
}

type CartState = {
  items: CartProductItem[]
  add: (product: Product) => void
  remove: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (product) =>
        set((state) => {
          const existing = state.items.find((i) => i.product.id === product.id)

          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i,
              ),
            }
          }

          return {
            items: [...state.items, { product, quantity: 1 }],
          }
        }),

      remove: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.product.id !== productId),
        })),

      setQuantity: (productId, quantity) =>
        set((state) => {
          const nextQty = Math.max(0, Math.floor(quantity))

          if (nextQty === 0) {
            return { items: state.items.filter((i) => i.product.id !== productId) }
          }

          return {
            items: state.items.map((i) =>
              i.product.id === productId ? { ...i, quantity: nextQty } : i,
            ),
          }
        }),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'cart',
      version: 1,
    },
  ),
)

export const selectCartCount = (items: CartProductItem[]) =>
  items.reduce((sum, i) => sum + i.quantity, 0)

export const selectCartSubtotal = (items: CartProductItem[]) =>
  items.reduce((sum, i) => sum + i.quantity * i.product.price, 0)
