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

/** Conectores que no dicen nada del repuesto; los mismos que descarta la API al buscar. */
const CONNECTORS = new Set([
  'a', 'al', 'con', 'de', 'del', 'el', 'en', 'la', 'las', 'los', 'o', 'para', 'por', 'un', 'una', 'unas', 'unos', 'y',
])

/**
 * Palabras de una búsqueda sin repetir y sin conectores: "bomba para agua" → ["bomba", "agua"].
 * Si lo buscado son solo conectores, se devuelven tal cual (algo hay que buscar).
 */
export function searchWords(query: string): string[] {
  const all = [...new Set(tokenize(query))]
  const meaningful = all.filter((word) => !CONNECTORS.has(word))
  return meaningful.length ? meaningful : all
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
