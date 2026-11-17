import { FilterCheckbox } from './FilterCheckbox'

interface StartsWithFilterProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

/**
 * Filtro "Comienza con": tildado, la búsqueda trae solo los artículos cuyo código o descripción empieza con lo
 * escrito en el buscador; sin tildar, también los que lo tienen en el medio.
 */
export function StartsWithFilter({ checked, onChange }: StartsWithFilterProps) {
  return (
    <FilterCheckbox
      label="Comienza con"
      hint="Trae solo los artículos cuyo código o descripción empieza con lo que escribiste"
      checked={checked}
      onChange={onChange}
    />
  )
}
