import type { ButtonHTMLAttributes } from 'react'
import { BUTTON_SPINNER, buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
  /** `primary`: rojo de marca (acción principal). `secondary`: blanco con borde (acciones de apoyo). */
  variant?: ButtonVariant
  /** `md`: ancho completo, alto 48. `sm`: ancho al contenido, alto 40. */
  size?: ButtonSize
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
    <button disabled={disabled || loading} className={buttonClasses(variant, size, className)} {...rest}>
      {loading && (
        <span
          aria-hidden
          className={`absolute left-4 h-5 w-5 animate-spin rounded-full border-2 ${BUTTON_SPINNER[variant]}`}
        />
      )}
      {children}
    </button>
  )
}
