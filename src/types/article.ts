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
  /**
   * Última vez que cambió el precio (ISO-8601). Los que llevan más de 30 días sin cambios se muestran
   * resaltados. Sin fecha no se resalta.
   */
  priceUpdatedAt?: string
  /** Stock por código de sucursal. */
  stock: Record<string, number>
  /**
   * Ubicación en la estantería por código de sucursal (ej. "A-03-12"). Solo viene para el personal
   * de la empresa; una sucursal sin clave no tiene ubicación asignada.
   */
  locations?: Record<string, string>
  /**
   * Punto de pedido: el stock mínimo del artículo, a partir del cual hay que reponer. Solo viene para el
   * personal de la empresa; 0 es que no tiene uno cargado.
   */
  reorderPoint?: number
  isOutlet?: boolean
}

/**
 * Una cajita del listado: el artículo cabecera con sus equivalentes.
 * Equivale a `ProductBox` en lupa-web.
 */
export interface ProductBox {
  articleCode: string
  description: string
  /** Foto en tamaño completo (se abre al tocar la miniatura). */
  photoUrl?: string
  /** Miniatura para la card. Si falta, se usa `photoUrl`. */
  photoThumbUrl?: string
  /** Líneas descriptivas. La primera es la principal. */
  details: string[]
  compatibleModels: CompatibleModel[]
  alternatives: AlternativeArticle[]
}

/**
 * Un artículo dentro de la ficha: lo mismo que en el listado más su descripción larga, rubro,
 * compatibilidades propias, códigos OEM, costo y márgenes.
 */
export interface DetailArticle extends AlternativeArticle {
  /** Líneas de la descripción larga. */
  details: string[]
  categoryName?: string
  compatibleModels: CompatibleModel[]
  oemCodes: string[]
  /** Precio sin IVA. */
  priceNet?: number
  /** Costo sin IVA. */
  cost?: number
  costUpdatedAt?: string
  /** Margen sobre el costo, en %. */
  markupPct?: number
  /** Margen sobre la venta, en %. */
  marginPct?: number
  photoUrl?: string
  photoThumbUrl?: string
}

/**
 * Ficha de un artículo: su cajita (grupo, compatibilidades de todos los equivalentes, foto) con la ficha
 * completa de cada uno. El primero de `alternatives` es el artículo pedido; el resto, sus alternativos.
 */
export interface ArticleDetail extends Omit<ProductBox, 'alternatives'> {
  /** Nombre del grupo de equivalencia, si el artículo tiene uno. */
  groupName?: string
  alternatives: DetailArticle[]
}

export interface SearchParams {
  query: string
  /** 1-based. */
  page: number
  pageSize?: number
  /** Solo artículos con stock en alguna sucursal (y, en cada cajita, solo los equivalentes que lo tienen). */
  inStock?: boolean
  /**
   * "Comienza con": solo los artículos cuyo código empieza con `query`, o cuya descripción empieza con la primera
   * palabra y tiene las demás en cualquier lugar. Sin `query` no cambia nada.
   */
  startsWith?: boolean
}

export interface SearchResponse {
  data: ProductBox[]
  page: number
  hasMore: boolean
  total: number
}
