import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PurchaseStats = {
  orders: number
  items: number
  spent: number
  lastPurchaseAt: string | null
}

type PurchaseLineItem = {
  productId: number
  title: string
  quantity: number
  unitPrice: number
}

export type PurchaseHistoryItem = {
  id: string
  total: number
  itemsCount: number
  purchasedAt: string
  lines: PurchaseLineItem[]
}

type ProfileState = {
  firstName: string
  lastName: string
  phone: string
  avatarUrl: string | null
  balance: number
  stats: PurchaseStats
  purchaseHistory: PurchaseHistoryItem[]
  topUp: (amount: number) => void
  recordPurchase: (payload: { total: number; lines: PurchaseLineItem[] }) => void
  updateProfile: (payload: { firstName?: string; lastName?: string; phone?: string }) => void
}

const normalizeAmount = (value: number) =>
  Number.isFinite(value) ? Math.max(0, Number(value)) : 0

export const useProfileStore = create<ProfileState>()(
  persist(
    (set) => ({
      firstName: 'Алексей',
      lastName: 'Ильин',
      phone: '',
      avatarUrl: null,
      balance: 120,
      stats: {
        orders: 0,
        items: 0,
        spent: 0,
        lastPurchaseAt: null,
      },
      purchaseHistory: [],

      topUp: (amount) =>
        set((state) => ({
          balance: state.balance + normalizeAmount(amount),
        })),

      updateProfile: (payload) =>
        set((state) => ({
          firstName: payload.firstName !== undefined ? payload.firstName.trim() : state.firstName,
          lastName: payload.lastName !== undefined ? payload.lastName.trim() : state.lastName,
          phone: payload.phone !== undefined ? payload.phone.trim() : state.phone,
        })),

      recordPurchase: ({ total, lines }) =>
        set((state) => {
          const safeTotal = normalizeAmount(total)
          const safeLines = lines
            .map((line) => ({
              productId: Math.max(0, Math.floor(line.productId)),
              title: line.title,
              quantity: Math.max(0, Math.floor(line.quantity)),
              unitPrice: normalizeAmount(line.unitPrice),
            }))
            .filter((line) => line.quantity > 0 && line.unitPrice >= 0 && line.title.trim())
          const safeItems = safeLines.reduce((sum, line) => sum + line.quantity, 0)

          if (safeTotal === 0 || safeItems === 0) {
            return {}
          }

          const purchasedAt = new Date().toISOString()

          return {
            balance: Math.max(0, state.balance - safeTotal),
            stats: {
              orders: state.stats.orders + 1,
              items: state.stats.items + safeItems,
              spent: state.stats.spent + safeTotal,
              lastPurchaseAt: purchasedAt,
            },
            purchaseHistory: [
              {
                id: `${Date.now()}-${safeItems}-${Math.round(safeTotal * 100)}`,
                total: safeTotal,
                itemsCount: safeItems,
                purchasedAt,
                lines: safeLines,
              },
              ...state.purchaseHistory,
            ].slice(0, 20),
          }
        }),
    }),
    {
      name: 'profile',
      version: 1,
    },
  ),
)
