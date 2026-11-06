import { useState } from 'react'

interface QuantityStepperProps {
  value: number
  /** Se llama con la cantidad nueva. Con 0 el padre decide qué hacer (quitar del carrito). */
  onChange: (value: number) => void
  /** Identificador legible para los labels accesibles (ej. código del artículo). */
  code: string
  size?: 'sm' | 'md'
}

/** Control − [cantidad] + con la cantidad editable a mano. */
export function QuantityStepper({ value, onChange, code, size = 'md' }: QuantityStepperProps) {
  const [draft, setDraft] = useState(String(value))
  // Si la cantidad cambia desde afuera (otro control, el panel del carrito), el borrador se resincroniza.
  const [syncedValue, setSyncedValue] = useState(value)
  if (syncedValue !== value) {
    setSyncedValue(value)
    setDraft(String(value))
  }

  function commit() {
    const parsed = Number.parseInt(draft, 10)
    if (Number.isNaN(parsed)) {
      setDraft(String(value))
      return
    }
    const next = Math.max(0, parsed)
    if (next !== value) onChange(next)
    else setDraft(String(value))
  }

  const btn = size === 'sm' ? 'h-8 w-7' : 'h-9 w-8'
  const input = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-9 w-10 text-base'

  return (
    <div className="inline-flex items-center rounded-full bg-white ring-1 ring-brand">
      <button
        type="button"
        aria-label={`Restar ${code}`}
        onClick={() => onChange(Math.max(0, value - 1))}
        className={`${btn} rounded-l-full font-bold text-brand hover:bg-brand-soft`}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        aria-label={`Cantidad ${code}`}
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.currentTarget.blur()
        }}
        onFocus={(e) => e.currentTarget.select()}
        className={`${input} border-x border-line bg-transparent text-center font-semibold text-ink tabular-nums focus:outline-none`}
      />
      <button
        type="button"
        aria-label={`Sumar ${code}`}
        onClick={() => onChange(value + 1)}
        className={`${btn} rounded-r-full font-bold text-brand hover:bg-brand-soft`}
      >
        +
      </button>
    </div>
  )
}
