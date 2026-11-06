import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { AlternativeArticle } from '../types/article'
import { CartProvider } from './CartProvider'
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

function setup() {
  return renderHook(() => useCart(), { wrapper: CartProvider })
}

describe('CartProvider', () => {
  it('arranca vacío', () => {
    const { result } = setup()
    expect(result.current.items).toEqual([])
    expect(result.current.count).toBe(0)
    expect(result.current.total).toBe(0)
  })

  it('agrega artículos y acumula cantidad del mismo', () => {
    const { result } = setup()
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
    const { result } = setup()
    act(() => result.current.add(fricRot))
    act(() => result.current.setQuantity('1-1', 5))
    expect(result.current.count).toBe(5)
    act(() => result.current.setQuantity('1-1', 0))
    expect(result.current.items).toEqual([])
  })

  it('quita y vacía', () => {
    const { result } = setup()
    act(() => result.current.add(fricRot))
    act(() => result.current.add(ferodo))
    act(() => result.current.remove('1-1'))
    expect(result.current.items.map((i) => i.article.articleCode)).toEqual(['1-2'])
    act(() => result.current.clear())
    expect(result.current.items).toEqual([])
  })

  it('persiste en sessionStorage y lo restaura al montar', () => {
    const { result, unmount } = setup()
    act(() => result.current.add(fricRot, 2))
    unmount()

    const { result: again } = setup()
    expect(again.current.count).toBe(2)
    expect(again.current.items[0].article.brandName).toBe('FRIC-ROT')
  })

  it('ignora storage corrupto o con forma inesperada', () => {
    sessionStorage.setItem('cart:items', '{rompido')
    expect(setup().result.current.items).toEqual([])
    sessionStorage.setItem('cart:items', '{"no":"array"}')
    expect(setup().result.current.items).toEqual([])
  })

  it('useCart falla fuera del provider', () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/)
  })
})
