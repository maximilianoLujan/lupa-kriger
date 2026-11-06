/** Sucursal o depósito con stock propio. */
export interface Warehouse {
  code: string
  /** Nombre corto para cabeceras de columna (ej. "GUA"). */
  shortName: string
  name: string
}

/** Un modelo de auto compatible con el artículo. */
export interface CompatibleModel {
  brandName: string
  model: string
  /** Año desde, si se conoce. */
  since?: string
  /** Año hasta, si se conoce. */
  until?: string
}

/**
 * Cada equivalente que se lista dentro de una cajita: el repuesto concreto
 * de una marca con su código, precio y stock.
 */
export interface AlternativeArticle {
  /** Código interno del sistema. */
  articleCode: string
  /** Código del fabricante, el que ve el cliente. */
  particularCode: string
  description: string
  brandCode: string
  brandName: string
  priceList: number
  /** Stock por código de sucursal. */
  stock: Record<string, number>
  isOutlet?: boolean
}

/**
 * Una cajita del listado: el artículo cabecera con sus equivalentes.
 * Equivale a `ProductBox` en lupa-web.
 */
export interface ProductBox {
  articleCode: string
  description: string
  photoUrl?: string
  /** Líneas descriptivas. La primera es la principal. */
  details: string[]
  compatibleModels: CompatibleModel[]
  alternatives: AlternativeArticle[]
}

export interface SearchParams {
  query: string
  /** 1-based. */
  page: number
  pageSize?: number
}

export interface SearchResponse {
  data: ProductBox[]
  page: number
  hasMore: boolean
  total: number
}
