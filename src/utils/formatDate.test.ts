import { describe, expect, it } from 'vitest'
import { formatDate } from './formatDate'

describe('formatDate', () => {
  it('muestra día, mes abreviado y año en español', () => {
    expect(formatDate('2026-11-09T10:12:00-03:00')).toBe('9 nov 2026')
    expect(formatDate('2026-07-14T12:40:00-03:00')).toBe('14 jul 2026')
  })

  it('devuelve vacío si la fecha no se puede leer', () => {
    expect(formatDate('no es una fecha')).toBe('')
  })
})
