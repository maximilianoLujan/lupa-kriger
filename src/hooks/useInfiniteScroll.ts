import { useEffect, useEffectEvent, useRef } from 'react'

/** Si el navegador no tiene IntersectionObserver, la pantalla muestra un botón "Cargar más" en su lugar. */
export function supportsInfiniteScroll() {
  return typeof IntersectionObserver !== 'undefined'
}

/**
 * Scroll infinito: devuelve un ref para un elemento centinela al final del listado.
 * Cuando el centinela entra en pantalla (o está a punto, por el margen) llama a `onReachEnd`.
 * Con `enabled = false` no observa nada (sin más páginas o cargando).
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLDivElement>(onReachEnd: () => void, enabled: boolean) {
  const ref = useRef<T>(null)
  // Siempre la última versión del callback, sin volver a crear el observer en cada render.
  const reachEnd = useEffectEvent(onReachEnd)

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled || !supportsInfiniteScroll()) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) reachEnd()
      },
      { rootMargin: '240px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [enabled])

  return ref
}
