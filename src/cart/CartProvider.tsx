import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { AlternativeArticle } from '../types/article'
import { CartContext, type CartItem } from './context'

const STORAGE_KEY = 'cart:items'

function readStored(): CartItem[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? (parsed as CartItem[]) : []
  } catch {
    return []
  }
}

/** Carrito en memoria, persistido en sessionStorage. Todavía no envía pedidos. */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readStored)

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items])

  const add = useCallback((article: AlternativeArticle, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.article.articleCode === article.articleCode)
      if (!existing) return [...prev, { article, quantity }]
      return prev.map((i) =>
        i.article.articleCode === article.articleCode ? { ...i, quantity: i.quantity + quantity } : i,
      )
    })
  }, [])

  const setQuantity = useCallback((articleCode: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.article.articleCode !== articleCode)
        : prev.map((i) => (i.article.articleCode === articleCode ? { ...i, quantity } : i)),
    )
  }, [])

  const remove = useCallback((articleCode: string) => {
    setItems((prev) => prev.filter((i) => i.article.articleCode !== articleCode))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      total: items.reduce((n, i) => n + i.quantity * i.article.priceList, 0),
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, add, setQuantity, remove, clear],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
