export type ButtonVariant = 'primary' | 'secondary'
export type ButtonSize = 'md' | 'sm'

// Las variantes se eligen por prop y no pisando clases con `className`: Tailwind ordena las utilidades
// en el CSS, no por el orden del atributo, así que `bg-white text-ink` perdía contra `bg-brand text-white`.
const VARIANT: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white shadow-md shadow-brand/25 hover:bg-brand-hover',
  secondary: 'bg-white text-ink ring-1 ring-line hover:bg-canvas',
}
const SIZE: Record<ButtonSize, string> = {
  md: 'h-12 w-full',
  sm: 'h-10 w-auto px-6',
}
export const BUTTON_SPINNER: Record<ButtonVariant, string> = {
  primary: 'border-white/40 border-t-white',
  secondary: 'border-line border-t-ink',
}

/** Clases compartidas por `Button` y `LinkButton`, así un link puede verse igual que un botón. */
export function buttonClasses(variant: ButtonVariant, size: ButtonSize, className = '') {
  return `relative flex items-center justify-center rounded-xl px-4 font-semibold transition active:scale-[0.98] focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${VARIANT[variant]} ${SIZE[size]} ${className}`
}
