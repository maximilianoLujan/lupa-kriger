const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

/**
 * Fecha corta en español: "2026-11-09T10:12:00-03:00" → "9 nov 2026", en la zona horaria del navegador.
 * Se arma a mano porque `Intl` cambia el formato según la versión ("9 nov. 2026", "9 de nov de 2026").
 * Si la fecha no se puede leer, devuelve "".
 */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}
