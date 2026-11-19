import { describe, expect, it } from 'vitest'
import { daysSince, isStalePrice } from './priceAge'

const NOW = new Date('2026-11-19T12:00:00-03:00').getTime()

describe('priceAge', () => {
  it('cuenta los días enteros desde la fecha', () => {
    expect(daysSince('2026-11-19T09:00:00-03:00', NOW)).toBe(0)
    expect(daysSince('2026-11-09T12:00:00-03:00', NOW)).toBe(10)
    // Una fecha a futuro (reloj desfasado) no da días negativos.
    expect(daysSince('2026-11-20T12:00:00-03:00', NOW)).toBe(0)
  })

  it('sin fecha o con una ilegible no hay días', () => {
    expect(daysSince(undefined, NOW)).toBeNull()
    expect(daysSince('ayer', NOW)).toBeNull()
  })

  it('un precio es viejo recién después de los 30 días', () => {
    expect(isStalePrice('2026-10-20T12:00:00-03:00', NOW)).toBe(false) // 30 días justos
    expect(isStalePrice('2026-10-19T12:00:00-03:00', NOW)).toBe(true) // 31
    expect(isStalePrice('2026-11-18T12:00:00-03:00', NOW)).toBe(false)
    expect(isStalePrice(undefined, NOW)).toBe(false)
  })
})
