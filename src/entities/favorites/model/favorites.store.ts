import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type FavoriteEntityType = 'product' | 'service' | 'promotion'

export type FavoriteItem = {
  key: string
  entityType: FavoriteEntityType
  entityId: string
  title: string
  description: string
  priceLabel?: string
  metaLabel?: string
  href: string
}

type FavoritesState = {
  favorites: FavoriteItem[]
  likes: Record<string, number>
  toggleFavorite: (item: FavoriteItem) => void
  addLike: (key: string) => void
}

export const buildFavoriteKey = (entityType: FavoriteEntityType, entityId: string | number) =>
  `${entityType}:${entityId}`

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set) => ({
      favorites: [],
      likes: {},

      toggleFavorite: (item) =>
        set((state) => {
          const exists = state.favorites.some((favorite) => favorite.key === item.key)

          if (exists) {
            return {
              favorites: state.favorites.filter((favorite) => favorite.key !== item.key),
            }
          }

          return {
            favorites: [item, ...state.favorites],
          }
        }),

      addLike: (key) =>
        set((state) => ({
          likes: {
            ...state.likes,
            [key]: (state.likes[key] ?? 0) + 1,
          },
        })),
    }),
    {
      name: 'favorites',
      version: 1,
    },
  ),
)
