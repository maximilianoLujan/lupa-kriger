import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({ loading = false, disabled, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`relative flex h-12 w-full items-center justify-center rounded-xl bg-brand px-4 font-semibold text-ink shadow-lg shadow-brand/40 transition active:scale-[0.98] hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-brand/50 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="absolute left-4 h-5 w-5 animate-spin rounded-full border-2 border-ink/20 border-t-ink"
        />
      )}
      {children}
    </button>
  )
}
