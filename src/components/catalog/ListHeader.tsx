import type { Warehouse } from '../../types/article'

interface ListHeaderProps {
  warehouses: Warehouse[]
}

/** Barra oscura con los títulos de columna, como en lupa-web. En mobile muestra solo las que aplican. */
export function ListHeader({ warehouses }: ListHeaderProps) {
  const stockLabels = (
    <span className="flex flex-col items-center">
      <span>STOCK</span>
      <span className="flex gap-1.5 text-[9px] font-normal text-white/70">
        {warehouses.map((w) => (
          <span key={w.code} className="w-7 text-center">
            {w.shortName}
          </span>
        ))}
      </span>
    </span>
  )

  return (
    <div className="rounded-xl bg-ink-dark px-3 py-2 text-[11px] font-semibold tracking-wide text-white sm:px-4">
      <div className="flex items-center justify-between lg:hidden">
        <span>MARCA</span>
        <span className="flex items-center gap-4">
          <span>PRECIO</span>
          {stockLabels}
        </span>
      </div>
      <div className="hidden lg:grid lg:grid-cols-[7rem_1fr_1fr_1.4fr] lg:gap-6">
        <span>FOTO</span>
        <span>DESCRIPCIÓN</span>
        <span>MODELO</span>
        <span className="flex items-center justify-between">
          <span>MARCA</span>
          <span>PRECIO</span>
          {stockLabels}
        </span>
      </div>
    </div>
  )
}
