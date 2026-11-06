interface StockBadgeProps {
  quantity: number
  /** Nombre corto de la sucursal, para accesibilidad. */
  warehouse: string
}

function level(quantity: number) {
  if (quantity > 5) return { classes: 'bg-emerald-100 text-emerald-900', label: quantity > 9 ? '+9' : String(quantity) }
  if (quantity > 0) return { classes: 'bg-amber-100 text-amber-900', label: String(quantity) }
  return { classes: 'bg-red-100 text-red-800', label: 'NO' }
}

/** Círculo de stock por sucursal, al estilo lupa-web: verde, amarillo o rojo. */
export function StockBadge({ quantity, warehouse }: StockBadgeProps) {
  const { classes, label } = level(quantity)
  return (
    <span
      role="img"
      aria-label={`${warehouse}: ${quantity > 0 ? `${quantity} en stock` : 'sin stock'}`}
      title={`${warehouse}: ${quantity}`}
      className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold ${classes}`}
    >
      {label}
    </span>
  )
}
