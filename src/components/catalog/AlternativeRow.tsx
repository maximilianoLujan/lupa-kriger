import type { AlternativeArticle, Warehouse } from '../../types/article'
import { formatPrice } from '../../utils/formatPrice'
import { AddToCartButton } from './AddToCartButton'
import { ALT_GRID } from './columns'
import { Highlight } from './Highlight'
import { StockBadge } from './StockBadge'

interface AlternativeRowProps {
  article: AlternativeArticle
  warehouses: Warehouse[]
  query: string
}

/**
 * Ubicación en la estantería, en el orden de las columnas de stock. Con una sola sucursal va la ubicación
 * sola ("A-03-12"); con varias, cada una con el nombre corto de su sucursal ("GUA A-03-12 · DEP B-01").
 */
function shelfLocation(article: AlternativeArticle, warehouses: Warehouse[]): string {
  return warehouses
    .flatMap((w) => {
      const location = article.locations?.[w.code]?.trim()
      if (!location) return []
      return [warehouses.length > 1 ? `${w.shortName} ${location}` : location]
    })
    .join(' · ')
}

/**
 * Una fila de equivalente: marca, código y ubicación en la estantería (si el usuario la puede ver) | precio |
 * stock por sucursal | agregar al carrito.
 */
export function AlternativeRow({ article, warehouses, query }: AlternativeRowProps) {
  const location = shelfLocation(article, warehouses)

  return (
    <li className={`${ALT_GRID} py-2`}>
      <div className="min-w-0" title={article.description}>
        <p className="truncate text-sm font-semibold text-ink">
          <Highlight text={article.brandName} query={query} />
          {article.isOutlet && (
            <span className="ml-2 rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-text uppercase">
              Outlet
            </span>
          )}
        </p>
        <p className="truncate text-xs text-ink-soft">
          <Highlight text={article.particularCode} query={query} />
        </p>
        {location && (
          <p className="truncate text-[11px] text-ink-soft" title={`Ubicación: ${location}`}>
            <span className="font-semibold">Ubic.</span> {location}
          </p>
        )}
      </div>

      <p className="text-right text-sm font-bold whitespace-nowrap text-emerald-600 tabular-nums">
        $ {formatPrice(article.priceList)}
      </p>

      <div className="flex gap-1.5">
        {warehouses.map((w) => (
          <StockBadge key={w.code} warehouse={w.shortName} quantity={article.stock[w.code] ?? 0} />
        ))}
      </div>

      <div className="flex justify-center">
        <AddToCartButton article={article} />
      </div>
    </li>
  )
}
