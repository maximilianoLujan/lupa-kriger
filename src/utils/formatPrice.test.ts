import { describe, expect, it } from 'vitest'
import { formatPrice } from './formatPrice'

describe('formatPrice', () => {
  it('separa miles con punto', () => {
    expect(formatPrice(28900)).toBe('28.900')
    expect(formatPrice(1234567)).toBe('1.234.567')
  })

  it('no agrega separador por debajo de mil', () => {
    expect(formatPrice(950)).toBe('950')
  })

  it('trunca decimales', () => {
    expect(formatPrice(9800.99)).toBe('9.800')
  })

  it('devuelve 0 para valores inválidos', () => {
    expect(formatPrice(Number.NaN)).toBe('0')
    expect(formatPrice(Number.POSITIVE_INFINITY)).toBe('0')
  })
})
