import { useId } from 'react'
import { formatDate } from '../../utils/formatDate'
import { formatPrice } from '../../utils/formatPrice'
import { daysSince, isStalePrice } from '../../utils/priceAge'

interface PriceTagProps {
  price: number
  /** Última vez que cambió el precio. Con más de 30 días se muestra resaltado y con la explicación al pasar. */
  updatedAt?: string
  className?: string
}

/**
 * Precio de un artículo. Si lleva más de 30 días sin modificarse va resaltado (fondo manteca) y, al pasar el
 * mouse, hacer foco o tocarlo, un tooltip dice hace cuánto no cambia.
 */
export function PriceTag({ price, updatedAt, className = '' }: PriceTagProps) {
  const tooltipId = useId()
  const text = `$ ${formatPrice(price)}`

  if (!isStalePrice(updatedAt)) {
    return <span className={`font-bold whitespace-nowrap text-emerald-600 tabular-nums ${className}`}>{text}</span>
  }

  const days = daysSince(updatedAt)
  return (
    <span className={`group relative inline-block ${className}`}>
      <span
        tabIndex={0}
        aria-describedby={tooltipId}
        className="cursor-help rounded-md bg-butter px-1.5 py-0.5 font-bold whitespace-nowrap text-amber-700 tabular-nums ring-1 ring-amber-200 focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        {text}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className="pointer-events-none absolute right-0 bottom-full z-20 mb-1 hidden w-max max-w-[15rem] rounded-lg bg-white px-2.5 py-1.5 text-left text-[11px] leading-snug font-medium whitespace-normal text-ink shadow-md ring-1 ring-line group-focus-within:block group-hover:block"
      >
        Precio sin modificar hace {days} días (desde el {formatDate(updatedAt!)}).
      </span>
    </span>
  )
}
