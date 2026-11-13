import type { Warehouse } from '../../types/article'
import { ALT_GRID, CARD_GRID } from './columns'

interface ListHeaderProps {
  warehouses: Warehouse[]
}

/**
 * Títulos de columna en una sola línea, con las mismas grillas que las cards
 * para que cada título quede exactamente sobre su columna. Va dentro del header fijo de la pantalla,
 * en una barra con el rojo del logo, así se distingue y sigue a la vista al hacer scroll.
 * Con un solo depósito la columna dice "STOCK"; con varios, el nombre corto de cada uno.
 */
export function ListHeader({ warehouses }: ListHeaderProps) {
  const alternativesHeader = (
    <div className={ALT_GRID}>
      <span>MARCA</span>
      <span className="text-right">PRECIO</span>
      {warehouses.length > 1 ? (
        <span className="flex gap-1.5" title="Stock por sucursal">
          {warehouses.map((w) => (
            <span key={w.code} className="w-7 text-center">
              {w.shortName}
            </span>
          ))}
        </span>
      ) : (
        <span className="text-center">STOCK</span>
      )}
      <span className="text-center">PEDIR</span>
    </div>
  )

  return (
    <div
      role="group"
      aria-label="Columnas del listado"
      className="rounded-xl bg-brand px-3 py-2.5 text-xs font-bold tracking-wider text-white shadow-sm shadow-brand/30 sm:px-4"
    >
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
