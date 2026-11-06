interface StockBadgeProps {
  quantity: number
  /** Nombre corto de la sucursal, para accesibilidad. */
  warehouse: string
}

function level(quantity: number) {
  if (quantity > 5) return { classes: 'bg-mint text-emerald-700', label: quantity > 9 ? '+9' : String(quantity) }
  if (quantity > 0) return { classes: 'bg-butter text-amber-700', label: String(quantity) }
  return { classes: 'bg-brand-soft text-brand-text', label: 'NO' }
}

/** Círculo de stock por sucursal: menta, manteca o rosa según cantidad. */
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
