import type { CompatibleModel } from '../types/article'

/** Texto del rango de años de un modelo compatible: "2008/2023", "desde 2017", "hasta 2012" o null. */
export function yearRange(m: CompatibleModel): string | null {
  if (m.since && m.until) return `${m.since}/${m.until}`
  if (m.since) return `desde ${m.since}`
  if (m.until) return `hasta ${m.until}`
  return null
}
