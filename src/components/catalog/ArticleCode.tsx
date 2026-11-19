import type { ReactNode } from 'react'

interface ArticleCodeProps {
  code: string
  /** Abre la ficha del artículo. Sin esto el código es texto común. */
  onOpen?: (code: string) => void
  /** Lo que se muestra (por ejemplo el código con la búsqueda resaltada). Por defecto, el código. */
  children?: ReactNode
}

/**
 * Código de un artículo. Con doble clic (o Enter, con el foco encima) abre su ficha; un solo clic no hace nada,
 * así se puede seguir seleccionando el código para copiarlo.
 */
export function ArticleCode({ code, onOpen, children = code }: ArticleCodeProps) {
  if (!onOpen) return <>{children}</>

  return (
    <button
      type="button"
      title="Doble clic para ver la ficha"
      aria-label={`Ver la ficha de ${code}`}
      onDoubleClick={() => onOpen(code)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') onOpen(code)
      }}
      className="cursor-pointer rounded-sm text-left font-[inherit] tracking-[inherit] text-inherit underline decoration-line decoration-dotted underline-offset-2 select-text hover:decoration-ink-soft focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
    >
      {children}
    </button>
  )
}
