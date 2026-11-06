import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useDebouncedValue } from './useDebouncedValue'

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers())
  afterEach(() => vi.useRealTimers())

  it('devuelve el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 100))
    expect(result.current).toBe('a')
  })

  it('espera a que el valor deje de cambiar', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 100), {
      initialProps: { v: 'a' },
    })

    rerender({ v: 'ab' })
    act(() => vi.advanceTimersByTime(50))
    rerender({ v: 'abc' })
    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('a')

    act(() => vi.advanceTimersByTime(50))
    expect(result.current).toBe('abc')
  })
})
