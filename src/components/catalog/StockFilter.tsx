import { FilterCheckbox } from './FilterCheckbox'

interface StockFilterProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

/** Filtro "Solo con stock": tildado, el catálogo oculta los artículos sin stock; sin tildar, muestra todo. */
export function StockFilter({ checked, onChange }: StockFilterProps) {
  return (
    <FilterCheckbox
      label="Solo con stock"
      hint="Oculta los artículos que no tienen stock"
      checked={checked}
      onChange={onChange}
    />
  )
}
