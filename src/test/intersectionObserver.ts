import { act } from '@testing-library/react'

type Callback = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => void

interface FakeObserver {
  callback: Callback
  targets: Set<Element>
  instance: IntersectionObserver
}

const observers = new Set<FakeObserver>()

/**
 * jsdom no tiene IntersectionObserver. Este doble registra los observers vivos para que los tests
 * disparen la intersección a mano con `intersect()`. Se instala una vez en `setup.ts`.
 */
export function installFakeIntersectionObserver() {
  class FakeIntersectionObserver implements IntersectionObserver {
    readonly root = null
    readonly rootMargin = ''
    readonly scrollMargin = ''
    readonly thresholds = [] as number[]
    private readonly record: FakeObserver

    constructor(callback: Callback) {
      this.record = { callback, targets: new Set(), instance: this }
      observers.add(this.record)
    }

    observe(target: Element) {
      this.record.targets.add(target)
    }

    unobserve(target: Element) {
      this.record.targets.delete(target)
    }

    disconnect() {
      observers.delete(this.record)
    }

    takeRecords(): IntersectionObserverEntry[] {
      return []
    }
  }

  Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    writable: true,
    value: FakeIntersectionObserver,
  })
}

/** Cuántos elementos están siendo observados ahora mismo (para asertar que el centinela se desconecta). */
export function observedTargets(): Element[] {
  return [...observers].flatMap((o) => [...o.targets])
}

/** Simula que todos los elementos observados entraron en pantalla. */
export function intersect() {
  act(() => {
    for (const { callback, targets, instance } of [...observers]) {
      const entries = [...targets].map((target) => ({ target, isIntersecting: true }) as IntersectionObserverEntry)
      if (entries.length) callback(entries, instance)
    }
  })
}
