import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { intersect, observedTargets } from '../test/intersectionObserver'
import { supportsInfiniteScroll, useInfiniteScroll } from './useInfiniteScroll'

function Sentinel({ onReachEnd, enabled }: { onReachEnd: () => void; enabled: boolean }) {
  const ref = useInfiniteScroll(onReachEnd, enabled)
  return <div ref={ref} data-testid="sentinel" />
}

describe('useInfiniteScroll', () => {
  it('llama al callback cuando el centinela entra en pantalla', () => {
    const onReachEnd = vi.fn()
    render(<Sentinel onReachEnd={onReachEnd} enabled />)
    expect(observedTargets()).toHaveLength(1)

    intersect()
    expect(onReachEnd).toHaveBeenCalledTimes(1)
  })

  it('deshabilitado no observa nada', () => {
    const onReachEnd = vi.fn()
    render(<Sentinel onReachEnd={onReachEnd} enabled={false} />)
    expect(observedTargets()).toHaveLength(0)
    intersect()
    expect(onReachEnd).not.toHaveBeenCalled()
  })

  it('usa siempre el último callback sin volver a observar', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Sentinel onReachEnd={first} enabled />)
    rerender(<Sentinel onReachEnd={second} enabled />)

    intersect()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
    expect(observedTargets()).toHaveLength(1)
  })

  it('al desmontar deja de observar', () => {
    const { unmount } = render(<Sentinel onReachEnd={() => {}} enabled />)
    unmount()
    expect(observedTargets()).toHaveLength(0)
  })

  it('detecta si el navegador soporta IntersectionObserver', () => {
    expect(supportsInfiniteScroll()).toBe(true)
    vi.stubGlobal('IntersectionObserver', undefined)
    expect(supportsInfiniteScroll()).toBe(false)
    const onReachEnd = vi.fn()
    render(<Sentinel onReachEnd={onReachEnd} enabled />)
    expect(observedTargets()).toHaveLength(0)
    vi.unstubAllGlobals()
  })
})
