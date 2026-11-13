interface StockFilterProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * Filtro "Solo con stock": un checkbox con forma de pastilla. Tildado, el catálogo oculta los artículos sin stock;
 * sin tildar, muestra todo. Toda la pastilla es clickeable y se pinta con el rojo del logo cuando está activo.
 */
export function StockFilter({ checked, onChange }: StockFilterProps) {
  return (
    <label
      title="Oculta los artículos que no tienen stock"
      className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-canvas py-1.5 pr-4 pl-2 text-sm font-medium text-ink ring-1 ring-line transition select-none hover:ring-brand has-checked:bg-white has-checked:ring-brand has-focus-visible:ring-2 has-focus-visible:ring-brand"
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="flex h-5 w-5 items-center justify-center rounded-md bg-white text-transparent ring-1 ring-line transition peer-checked:bg-brand peer-checked:text-white peer-checked:ring-brand"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      Solo con stock
    </label>
  )
}
