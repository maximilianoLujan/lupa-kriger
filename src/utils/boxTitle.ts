import type { AlternativeArticle, ProductBox } from '../types/article'
import { escapeRegExp } from './text'

/** Separadores que quedan colgando al sacar el código: "- FILTRO", "FILTRO /", "FILTRO () MANN". */
const EDGE_SEPARATORS = /^[\s\-–—·|/,;:.]+|[\s\-–—·|/,;:]+$/g

/**
 * Saca el código del artículo de su descripción, si está escrito adentro como palabra entera
 * ("FILTRO W 712/75 MANN" → "FILTRO MANN"). No toca el código cuando es parte de otra palabra,
 * y si la descripción era solo el código la devuelve tal cual.
 */
export function stripCode(description: string, ...codes: string[]): string {
  let text = description
  for (const code of new Set(codes.map((c) => c.trim()).filter(Boolean))) {
    const pattern = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegExp(code)}(?![\\p{L}\\p{N}])`, 'giu')
    text = text.replace(pattern, ' ')
  }
  const cleaned = text
    .replace(/\(\s*\)|\[\s*\]/g, ' ')
    .replace(/\s+([-–—|/])(\s+[-–—|/])+\s+/g, ' $1 ')
    .replace(/\s+/g, ' ')
    .replace(EDGE_SEPARATORS, '')
  return cleaned || description.trim()
}

function hasStock(article: AlternativeArticle): boolean {
  return Object.values(article.stock).some((quantity) => quantity > 0)
}

/**
 * Título de la cajita: la descripción del primer equivalente con stock (si ninguno tiene, la del primero),
 * sin el código adentro. Sin equivalentes, la primera línea de detalle o la descripción de la cabecera.
 */
export function boxTitle(box: ProductBox): string {
  const article = box.alternatives.find(hasStock) ?? box.alternatives[0]
  if (article?.description.trim()) {
    return stripCode(article.description, article.particularCode, article.articleCode, box.articleCode)
  }
  return stripCode(box.details[0] ?? box.description, box.articleCode)
}
