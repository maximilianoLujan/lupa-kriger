import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AlternativeArticle } from '../types/article'
import { CART_STORAGE_KEY, useCartStore } from './store'
import { useCart } from './useCart'

const fricRot: AlternativeArticle = {
  articleCode: '1-1',
  particularCode: 'FR-1024',
  description: 'Pastilla',
  brandCode: 'FRR',
  brandName: 'FRIC-ROT',
  priceList: 1000,
  stock: { GUA: 1 },
}
const ferodo: AlternativeArticle = { ...fricRot, articleCode: '1-2', particularCode: 'HQF', brandName: 'FERODO', priceList: 250 }

describe('carrito (Zustand)', () => {
  it('arranca vacío', () => {
    const { result } = renderHook(() => useCart())
    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('agrega artículos y acumula cantidad del mismo', () => {
    const { result } = renderHook(() => useCart())
    act(() => result.current.add(fricRot))
    act(() => result.current.add(fricRot, 2))
    act(() => result.current.add(ferodo))

    expect(result.current.items.map((i) => [i.article.articleCode, i.quantity])).toEqual([
      ['1-1', 3],
      ['1-2', 1],
    ])
    expect(result.current.count).toBe(4)
    expect(result.current.total).toBe(3 * 1000 + 250)
  })

  it('cambia la cantidad y en 0 lo saca', () => {
    const { result } = renderHook(() => useCart())
    act(() => result.current.add(fricRot))
    act(() => result.current.setQuantity('1-1', 5))
    expect(result.current.count).toBe(5)
    act(() => result.current.setQuantity('1-1', 0))
    expect(result.current.items).toEqual([])
  })

  it('quita y vacía', () => {
    const { result } = renderHook(() => useCart())
    act(() => result.current.add(fricRot))
    act(() => result.current.add(ferodo))
    act(() => result.current.remove('1-1'))
    expect(result.current.items.map((i) => i.article.articleCode)).toEqual(['1-2'])
    act(() => result.current.clear())
    expect(result.current.items).toEqual([])
  })

  it('dos componentes ven el mismo carrito', () => {
    const a = renderHook(() => useCart())
    const b = renderHook(() => useCart())
    act(() => a.result.current.add(fricRot, 2))
    expect(b.result.current.count).toBe(2)
  })

  it('persiste en sessionStorage y lo restaura al rehidratar', async () => {
    const { result } = renderHook(() => useCart())
    act(() => result.current.add(fricRot, 2))
    const stored = JSON.parse(sessionStorage.getItem(CART_STORAGE_KEY)!) as { state: { items: unknown[] } }
    expect(stored.state.items).toHaveLength(1)

    // setState también persiste, así que se restaura lo guardado antes de rehidratar.
    const raw = sessionStorage.getItem(CART_STORAGE_KEY)!
    useCartStore.setState({ items: [] })
    sessionStorage.setItem(CART_STORAGE_KEY, raw)
    await act(async () => {
      await useCartStore.persist.rehydrate()
    })
    expect(useCartStore.getState().items[0].quantity).toBe(2)
  })

  it('ignora storage corrupto', async () => {
    sessionStorage.setItem(CART_STORAGE_KEY, '{rompido')
    await act(async () => {
      await useCartStore.persist.rehydrate()
    })
    expect(useCartStore.getState().items).toEqual([])
  })
})
