import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  trailing?: ReactNode
  invalid?: boolean
}

export function Input({ label, trailing, invalid = false, className = '', ...rest }: InputProps) {
  const id = useId()
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <span className="relative block">
        <input
          id={id}
          aria-invalid={invalid || undefined}
          className={`h-12 w-full rounded-xl border bg-white px-4 text-base text-ink-dark placeholder:text-gray-400 transition focus:outline-none focus:ring-4 ${
            invalid
              ? 'border-brand focus:border-brand focus:ring-brand/20'
              : 'border-gray-300 focus:border-ink focus:ring-ink/10'
          } ${trailing ? 'pr-12' : ''} ${className}`}
          {...rest}
        />
        {trailing && (
          <span className="absolute inset-y-0 right-0 flex items-center pr-3">{trailing}</span>
        )}
      </span>
    </label>
  )
}
