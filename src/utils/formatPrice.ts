/** Formatea un precio como entero con separador de miles argentino: 12345.6 → "12.345". */
export function formatPrice(value: number): string {
  const safe = Number.isFinite(value) ? value : 0
  return Math.floor(safe)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.')
}
