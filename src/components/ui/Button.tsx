import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({ loading = false, disabled, children, className = '', ...rest }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`relative flex h-12 w-full items-center justify-center rounded-xl bg-brand px-4 font-semibold text-white shadow-md shadow-brand/25 transition active:scale-[0.98] hover:bg-brand-hover focus-visible:ring-4 focus-visible:ring-brand/30 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden
          className="absolute left-4 h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white"
        />
      )}
      {children}
    </button>
  )
}
