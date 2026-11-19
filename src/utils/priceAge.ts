/** Días sin cambios a partir de los cuales un precio se muestra resaltado. */
export const STALE_PRICE_DAYS = 30

const DAY_MS = 24 * 60 * 60 * 1000

/** Días enteros que pasaron desde `iso`; null si la fecha falta o no se puede leer. */
export function daysSince(iso: string | undefined, now: number = Date.now()): number | null {
  if (!iso) return null
  const time = new Date(iso).getTime()
  if (Number.isNaN(time)) return null
  return Math.max(0, Math.floor((now - time) / DAY_MS))
}

/** ¿El precio lleva más de 30 días sin modificarse? Sin fecha no se sabe: no se resalta. */
export function isStalePrice(iso: string | undefined, now: number = Date.now()): boolean {
  const days = daysSince(iso, now)
  return days !== null && days > STALE_PRICE_DAYS
}
