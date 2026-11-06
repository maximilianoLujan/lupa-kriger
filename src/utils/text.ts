/** Minúsculas, sin acentos y sin espacios de más. Para comparar texto de búsqueda. */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Separa una búsqueda en palabras normalizadas, ignorando vacíos. */
export function tokenize(query: string): string[] {
  return normalizeText(query).split(/\s+/).filter(Boolean)
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
