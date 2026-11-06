import { createContext } from 'react'
import type { AlternativeArticle } from '../types/article'

export interface CartItem {
  article: AlternativeArticle
  quantity: number
}

export interface CartContextValue {
  items: CartItem[]
  /** Unidades totales. */
  count: number
  /** Suma de precio de lista por cantidad. */
  total: number
  add: (article: AlternativeArticle, quantity?: number) => void
  setQuantity: (articleCode: string, quantity: number) => void
  remove: (articleCode: string) => void
  clear: () => void
}

export const CartContext = createContext<CartContextValue | null>(null)
