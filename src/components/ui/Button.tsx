import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  /** `primary`: rojo de marca (acción principal). `secondary`: blanco con borde (acciones de apoyo). */
  variant?: 'primary' | 'secondary'
  /** `md`: ancho completo, alto 48. `sm`: ancho al contenido, alto 40. */
  size?: 'md' | 'sm'
}

// Las variantes se eligen por prop y no pisando clases con `className`: Tailwind ordena las utilidades
// en el CSS, no por el orden del atributo, así que `bg-white text-ink` perdía contra `bg-brand text-white`.
const VARIANT = {
  primary: 'bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-hover',
  secondary: 'bg-white text-ink ring-1 ring-line hover:bg-canvas',
}
const SIZE = {
  md: 'h-12 w-full',
  sm: 'h-10 w-auto px-6',
}
const SPINNER = {
  primary: 'border-white/40 border-t-white',
  secondary: 'border-line border-t-ink',
}

export function Button({
  loading = false,
  variant = 'primary',
  size = 'md',
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`relative flex items-center justify-center rounded-xl px-4 font-semibold transition active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className={`absolute left-4 h-5 w-5 animate-spin rounded-full border-2 ${SPINNER[variant]}`}
        />
      )}
      {children}
    </button>
  )
}
