import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { AlternativeArticle } from '../types/article'

export interface CartItem {
  article: AlternativeArticle
  quantity: number
}

export interface CartState {
  items: CartItem[]
  add: (article: AlternativeArticle, quantity?: number) => void
  setQuantity: (articleCode: string, quantity: number) => void
  remove: (articleCode: string) => void
  clear: () => void
}

export const CART_STORAGE_KEY = 'cart:items'

/** Carrito global (Zustand), persistido en sessionStorage. Todavía no envía pedidos. */
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      add: (article, quantity = 1) =>
        set(({ items }) => {
          const existing = items.find((i) => i.article.articleCode === article.articleCode)
          if (!existing) return { items: [...items, { article, quantity }] }
          return {
            items: items.map((i) =>
              i.article.articleCode === article.articleCode ? { ...i, quantity: i.quantity + quantity } : i,
            ),
          }
        }),

      setQuantity: (articleCode, quantity) =>
        set(({ items }) => ({
          items:
            quantity <= 0
              ? items.filter((i) => i.article.articleCode !== articleCode)
              : items.map((i) => (i.article.articleCode === articleCode ? { ...i, quantity } : i)),
        })),

      remove: (articleCode) => set(({ items }) => ({ items: items.filter((i) => i.article.articleCode !== articleCode) })),

      clear: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
)

export const selectCount = (state: CartState) => state.items.reduce((n, i) => n + i.quantity, 0)
export const selectTotal = (state: CartState) => state.items.reduce((n, i) => n + i.quantity * i.article.priceList, 0)
