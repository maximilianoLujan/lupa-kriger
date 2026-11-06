import type { Warehouse } from '../../types/article'
import { ALT_GRID, CARD_GRID } from './columns'

interface ListHeaderProps {
  warehouses: Warehouse[]
}

/**
 * Títulos de columna en una sola línea, con las mismas grillas que las cards
 * para que cada título quede exactamente sobre su columna.
 */
export function ListHeader({ warehouses }: ListHeaderProps) {
  const alternativesHeader = (
    <div className={ALT_GRID}>
      <span>MARCA</span>
      <span className="text-right">PRECIO</span>
      <span className="flex gap-1.5" title="Stock por sucursal">
        {warehouses.map((w) => (
          <span key={w.code} className="w-7 text-center">
            {w.shortName}
          </span>
        ))}
      </span>
      <span className="text-center">PEDIR</span>
    </div>
  )

  return (
    <div className="rounded-2xl bg-brand-soft px-3 py-2 text-[11px] font-semibold tracking-wide text-ink sm:px-4">
      <div className="lg:hidden">{alternativesHeader}</div>
      <div className={`hidden ${CARD_GRID}`}>
        <span>FOTO</span>
        <span>DESCRIPCIÓN</span>
        <span>MODELO</span>
        {alternativesHeader}
      </div>
    </div>
  )
}
