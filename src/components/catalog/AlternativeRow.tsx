import type { AlternativeArticle, Warehouse } from '../../types/article'
import { formatPrice } from '../../utils/formatPrice'
import { Highlight } from './Highlight'
import { StockBadge } from './StockBadge'

interface AlternativeRowProps {
  article: AlternativeArticle
  warehouses: Warehouse[]
  query: string
}

/** Una fila de equivalente: marca y código, precio y stock por sucursal. */
export function AlternativeRow({ article, warehouses, query }: AlternativeRowProps) {
  return (
    <li className="grid grid-cols-[1fr_auto_auto] items-center gap-3 py-2">
      <div className="min-w-0" title={article.description}>
        <p className="truncate text-sm font-semibold text-ink-dark">
          <Highlight text={article.brandName} query={query} />
          {article.isOutlet && (
            <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-dark uppercase">
              Outlet
            </span>
          )}
        </p>
        <p className="truncate text-xs text-gray-500">
          <Highlight text={article.particularCode} query={query} />
        </p>
      </div>

      <p className="text-right text-sm font-bold whitespace-nowrap text-brand-dark tabular-nums">
        $ {formatPrice(article.priceList)}
      </p>

      <div className="flex gap-1.5">
        {warehouses.map((w) => (
          <StockBadge key={w.code} warehouse={w.shortName} quantity={article.stock[w.code] ?? 0} />
        ))}
      </div>
    </li>
  )
}
